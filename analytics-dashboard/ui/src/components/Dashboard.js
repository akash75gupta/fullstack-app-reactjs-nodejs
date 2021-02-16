import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Card, Col, Row, Typography, Modal } from 'antd';
import html2canvas from 'html2canvas';
import underscore from 'underscore';
import PropTypes from 'prop-types';

import * as ReportAgent from '../agent/ReportAgent';
import * as RestClientUtil from '../util/RestClientUtil';
import * as Config from '../config/Config';
import * as Constants from '../config/Constants';
import LoginSuccessReport from '../report/myapp/LoginSuccessReport';
import Feedback from './Feedback';
import SubbrandSelectOption from './SubbrandSelectOption';
import UserSessionLengthDistributionReport from '../report/myapp/UserSessionLengthDistributionReport';
import CapturedSearchTextReport from '../report/myapp/CapturedSearchTextReport';
import MfaSuccessByTypeReport from '../report/myapp/MfaSuccessByTypeReport';
import PdfDownloader from './PdfDownloader';
import * as PdfCacheUtil from '../util/PdfCacheUtil';
import Error from './Error';

import '../styles/master.css'

const { Text } = Typography;

export default class Dashboard extends Component {
    componentDidMount() {
        this.setTimeout();
        window.addEventListener('resetTimer', () => this.resetTimeout());
        this.prepareForPdfDownload();
    }

    componentDidUpdate(){
        this.prepareForPdfDownload();
    }

    clearTimeout = () => {
        if (this.warnTimeout) clearTimeout(this.warnTimeout);
        if (this.logoutTimeout) clearTimeout(this.logoutTimeout);
    };

    setTimeout = () => {
        //Show warning on nearing timeout
        this.warnTimeout = setTimeout(this.warn, Config.APPLICATION_LOGOUT_WARNING_TIMEOUT);
        //Logout the user on timeout
        this.logoutTimeout = setTimeout(this.logout, Config.APPLICATION_LOGOUT_TIMEOUT);
    };

    //Reset the timer if any API call is made to the middleware
    resetTimeout = () => {
        this.clearTimeout();
        this.setTimeout();
    };

    warn = () => {
        //Referring that to this to not loose the reference of this in modal
        let that = this;

        Modal.confirm({
            width: "50%",
            title: Constants.SESSION_LOGOUT.title,
            content: Constants.SESSION_LOGOUT.content,
            okText: Constants.SESSION_LOGOUT.okText,
            maskClosable: false,
            cancelText: Constants.SESSION_LOGOUT.cancelText,
            style : {
                fontStyle: 'normal',
                fontWeight: 'bold',
                fontSize: '20px',
                lineHeight: '28px',
                marginBottom: '32px',
                color: '#747474'
            },
            onOk() {
               let payload = {
                   userInfo: that.state.userInfo
               }
                //console.log("Extend Session Payload: "+JSON.stringify(payload));
               that.resetTimeout();
               RestClientUtil.dispatchRequestToExtendSession(payload).then(()=>{
                   that.resetTimeout();
               }).catch((error)=>{
                    console.error(error);
                    that.logout();
               });
            },
            onCancel() {
                that.logout();
            },
        })
    };

    logout = () => {
        //console.log("Executing Dashboard.logout()");
        let returnUrl = this.props.requestParams.returnUrl;
        let returnUrlDomain = null;

        try{
            if(!returnUrl.includes("/app")){
                throw new Error("#Error logging out. Invalid return URL: "+returnUrl);
            }
            sessionStorage.removeItem("cache");
            returnUrlDomain = returnUrl.split("/app")[0];
            //console.log("Return URL Domain: "+returnUrlDomain);
            window.location.assign(returnUrlDomain+"/app/logout.do");
        }catch(error){
            console.error(error);
            ReactDOM.render(
                <Error />,
                document.getElementById('root')
            );
        }
    };

    static propTypes = {
        requestParams: PropTypes.object.isRequired,
    }

    //Declaring class level variables
    constructor(props) {
        super(props);
    //console.log("Constructing <Dashboard>.");
    //console.log("Request params: " + JSON.stringify(this.props.requestParams));

        this.state = {
            userInfo: {
                cobrandId: this.props.requestParams.cobrandId,
                cobrandName: this.props.requestParams.cobrandName,
                sessionId: this.props.requestParams.sessionId,
                appId: this.props.requestParams.appId
            },
            returnUrl: this.props.requestParams.returnUrl,
            customerSelectionList: this.getCustomerSelectionList(props.requestParams.subscribedCustomersList),
            selectedCustomer: this.chooseDefaultSelectedCustomer(props.requestParams.subscribedCustomersList),
            showCustomerSelectionDropdown: this.showCustomerSelectionDropdown(props.requestParams.subscribedCustomersList),
            showCustomerFeedbackButton: this.props.requestParams.showFeedbackButton,
            projectId: Config.DEFAULT_PROJECT,
            enablePdfDownload: false,
            pdfData: null,
            reports: {
                [Config.MYAPP_REPORT_1]: {
                    data: null,
                    lastRefreshTimestamp: null,
                    status: Constants.REPORT_DEFAULT_STATUS,
                    message: Constants.REPORT_DEFAULT_MESSAGE
                },
                [Config.MYAPP_REPORT_2]: {
                    data: null,
                    lastRefreshTimestamp: null,
                    status: Constants.REPORT_DEFAULT_STATUS,
                    message: Constants.REPORT_DEFAULT_MESSAGE
                },
                [Config.MYAPP_REPORT_3]: {
                    data: null,
                    lastRefreshTimestamp: null,
                    status: Constants.REPORT_DEFAULT_STATUS,
                    message: Constants.REPORT_DEFAULT_MESSAGE
                },
                [Config.MYAPP_REPORT_4]: {
                    data: null,
                    lastRefreshTimestamp: null,
                    status: Constants.REPORT_DEFAULT_STATUS,
                    message: Constants.REPORT_DEFAULT_MESSAGE
                }
            }
        };

        this.initCache(this.state.customerSelectionList);//checked
        ReportAgent.getReports(this.state, this.updateReportForSelectedCustomer);
     
    }

    updateSelectedCustomer = (newSelectedCustomer) => {
    //console.log("Executing Dashboard.updateSelectedCustomer() with param: " + JSON.stringify(newSelectedCustomer));
        if (!underscore.isEqual(this.state.selectedCustomer, newSelectedCustomer)) {
            //console.log("Previous selected customer: " + this.state.selectedCustomer);
            this.state.selectedCustomer = newSelectedCustomer;
            this.resetReportForSelectedCustomer();
            this.resetPdfDownload();
            this.updateReportForSelectedCustomer(this.state.selectedCustomer);
        }
    }

    resetReportForSelectedCustomer = () => {
    //console.log("Executing Dashboard.resetReportForSelectedCustomer()");
        this.state.selectedCustomerReports = {
            [Config.MYAPP_REPORT_1]: {
                data: null,
                lastRefreshTimestamp: null,
                status: Constants.REPORT_DEFAULT_STATUS,
                message: Constants.REPORT_DEFAULT_MESSAGE
            },
            [Config.MYAPP_REPORT_2]: {
                data: null,
                lastRefreshTimestamp: null,
                status: Constants.REPORT_DEFAULT_STATUS,
                message: Constants.REPORT_DEFAULT_MESSAGE
            },
            [Config.MYAPP_REPORT_3]: {
                data: null,
                lastRefreshTimestamp: null,
                status: Constants.REPORT_DEFAULT_STATUS,
                message: Constants.REPORT_DEFAULT_MESSAGE
            },
            [Config.MYAPP_REPORT_4]: {
                data: null,
                lastRefreshTimestamp: null,
                status: Constants.REPORT_DEFAULT_STATUS,
                message: Constants.REPORT_DEFAULT_MESSAGE
            }
        }
    }

    getCustomerSelectionList = (subscribedCustomersList) => {
    //console.log("Dashboard.getCustomerSelectionList( " + JSON.stringify(subscribedCustomersList)
    //        + ")\\nCreating a list to select customers from.");

        let customerSelectionList = null;

        if (subscribedCustomersList.length === null || subscribedCustomersList.length < 1) {
            throw new Error("Subscribed customers list cannot be null or empty.");
        } else if (subscribedCustomersList.length > 1) {
            if (customerSelectionList === null) {
                customerSelectionList = [];
            }
            customerSelectionList.push({
                id: "0",
                name: "All Customers",
                type: "ALL"
            });
        }

        if (customerSelectionList === null) {
            customerSelectionList = [];
        }
        customerSelectionList.push(...subscribedCustomersList);

        //console.log("Dashboard.getCustomerSelectionList() with value: " + JSON.stringify(customerSelectionList));

        return customerSelectionList;
    }

    chooseDefaultSelectedCustomer = (subscribedCustomersList) => {
    //console.log("Dashboard.chooseDefaultSelectedCustomer( " + JSON.stringify(subscribedCustomersList)
    //        + ")\\nSelecting default customer from a list of subscribed customers");

        let defaultCustomer = null;
        if (subscribedCustomersList.length === null || subscribedCustomersList.length < 1) {
            throw new Error("Subscribed customers list cannot be null or empty.");
        } else if (subscribedCustomersList.length > 1) {
            defaultCustomer = "0"
        } else if (subscribedCustomersList.length === 1) {
            defaultCustomer = subscribedCustomersList[0].id;
        }

    //console.log("Dashboard.getCustomerSelectionList() with value: " + JSON.stringify(defaultCustomer));

        return defaultCustomer;
    }

    showCustomerSelectionDropdown = (subscribedCustomersList) => {
    //console.log("Executing Dashboard.showCustomerSelectionDropdown() for param -subscribedCustomersList: "
    //        + JSON.stringify(subscribedCustomersList));
        let showCustomerSelectionDropdown = false;

        if (subscribedCustomersList.length === null || subscribedCustomersList.length < 1) {
            throw new Error("Subscribed customers list cannot be null or empty.");
        } else if (subscribedCustomersList.length > 1) {
            showCustomerSelectionDropdown = true;
        }  else if (subscribedCustomersList[0].type === "SUBBRAND" && !(subscribedCustomersList[0].id === this.props.requestParams.cobrandId)) {
            showCustomerSelectionDropdown = true;
        }

    //console.log("Returning from Dashboard.showCustomerSelectionDropdown() with value: " + showCustomerSelectionDropdown);

        return showCustomerSelectionDropdown;
    }

    initCache = (customerSelectionList) => {
    //console.log("Executing Dashboard.initReports() with param: " + JSON.stringify(customerSelectionList));
    //console.log("Initializing Reports for all the customers");
        let cache = {
            reports: [
                {
                    id: Config.MYAPP_REPORT_1,
                    customers: []
                },
                {
                    id: Config.MYAPP_REPORT_2,
                    customers: []
                },
                {
                    id: Config.MYAPP_REPORT_3,
                    customers: []
                },
                {
                    id: Config.MYAPP_REPORT_4,
                    customers: []
                }
            ]
        };


        for (let report of cache.reports) {
            for (let customer of customerSelectionList) {
                report.customers.push({
                    id: customer.id,
                    data: null,
                    lastRefreshTimestamp: null,
                    status: Constants.REPORT_DEFAULT_STATUS,
                    message: Constants.REPORT_DEFAULT_MESSAGE
                });
            }
        }
        sessionStorage.setItem("cache", JSON.stringify(cache));
    //console.log("After initializing reports:", sessionStorage.getItem("cache"));
    }

    areReportsReady = (selectedCustomer) => {
    //console.log("Executing Dashboard.areReportsReady(" + selectedCustomer + ") - Checking if all the reports are loaded");
        let reportsReady = true;

        for (let report of this.state.selectedCustomerReports) {
        //console.log("Checking for report: " + JSON.stringify(report));
            for (let customer of report.customers) {
            //console.log("Checking for customer: " + JSON.stringify(customer));
                if (customer.id === selectedCustomer && !customer.ready) {
                    reportsReady = false;
                //console.log("Returning from Dashboard.areReportsReady() with value: " + reportsReady);
                    return reportsReady;
                }
            }
        }

    //console.log("Returning from Dashboard.areReportsReady() with value: " + reportsReady);
        return reportsReady;
    }

    updateReportForSelectedCustomer = (selectedCustomer) => {
    //console.log("Executing Dashboard.updateReportForSelectedCustomer(" + JSON.stringify(selectedCustomer) + ")");
        let cache = JSON.parse(sessionStorage.getItem("cache"));
        let cachedReports = cache.reports;
    //console.log("Cached Reports: " + JSON.stringify(cachedReports));
    //console.log("Selected customer report: " + JSON.stringify(this.state.reports));
        let update = false;

        for (let i = 0; i < cachedReports.length; i++) {
            for (let customer of cachedReports[i].customers) {
                if (customer.id === selectedCustomer) {
                    if (!underscore.isEqual(this.state.reports[cachedReports[i].id].data, customer.data)) {
                        this.state.reports[cachedReports[i].id] = {
                            data: customer.data,
                            lastRefreshTimestamp: customer.lastRefreshTimestamp,
                            status: customer.status,
                            message: customer.message
                        };

                        update = true;
                    }
                    break;
                }
            }
        }
    //console.log("Returning from Dashboard.updateReportForSelectedCustomer()");

        if (update) {
            //console.log("Force Updating");
            //console.log("After Update. Selected customer report: " + JSON.stringify(this.state.reports))
            this.forceUpdate();
        }
    }

    resetPdfDownload = () => {
    //console.log("Resetting PDF flag");
        this.state.enablePdfDownload = false;
    }

    prepareForPdfDownload = () => {
    //console.log("Executing Dashboard.prepareForPdfDownload()");

        if (this.pdfReady() && this.enablePdfDownload()) {
        //console.log("Adding delay to PDF Download.");
            setTimeout(()=>{
                this.createPdfData().then((pdfData)=>{
                    if(this.state.enablePdfDownload !== true){
                    //console.log("###Updating State for PDF Download:");
                        PdfCacheUtil.saveReports(this.state.reports);
                        this.setState({
                            enablePdfDownload:true,
                            pdfData:pdfData
                        });
                    }
                }).catch((error)=>{
                    console.error(error);
                });
            },5000);
        }
    }

    enablePdfDownload = () =>{
    //console.log("Executing Dashboard.enablePdfDownload()");
    //console.log("Is Pdf download enabled?");
        let pdfDownloadEnabled = false;

    //console.log("Report presently displayed on Dashboard: "+JSON.stringify(this.state.reports));
    //console.log("Report stored in pdfCache: "+JSON.stringify(PdfCacheUtil.getReports()));

        if(!underscore.isEqual(this.state.reports, PdfCacheUtil.getReports())){
            pdfDownloadEnabled = true;
        }

    //console.log("Returning from Dashboard.enablePdfDownload with value- "+pdfDownloadEnabled);
        return pdfDownloadEnabled;
    }

    createPdfData = () => {
    //console.log("Executing Dashboard.createPdfData() - Creating Pdf data");
        let pdfData = null;
        return new Promise((resolve, reject)=>{
            let promises = [];
            for(let i=1; i<=4;i++){
                let reportHtmlElement = document.getElementById('report-'+i);
                promises[i-1] = html2canvas(reportHtmlElement);
            }

            Promise.all(promises).then((canvases) => {
                let reportImageElement=null;
                for(let i=0; i<canvases.length; i++){
                    reportImageElement = canvases[i].toDataURL('image/png');  
                    if(pdfData === null){
                        pdfData = [];
                    }                      
                    pdfData.push(reportImageElement);
                }
            //console.log("Returing from Dashboard.createPdfData() with value- "+JSON.stringify(pdfData));
                resolve(pdfData);
            }).catch((errors)=>{
                console.error("Returing from Dashboard.createPdfData() with error");
                reject(errors[0]);
            });
        });
    }

    pdfReady = () => {
    //console.log("Executing Dashboard.pdfReady()");

        let isPdfReady = false;

        let combinedReportStatus = this.state.reports[Config.MYAPP_REPORT_1].status +
            this.state.reports[Config.MYAPP_REPORT_2].status +
            this.state.reports[Config.MYAPP_REPORT_3].status +
            this.state.reports[Config.MYAPP_REPORT_4].status;

        if (combinedReportStatus === 4) {
            isPdfReady = true;
        }

    //console.log("Combined Report Status: " + combinedReportStatus);
    //console.log("Returning from Dashboard.pdfReady() with value- " + isPdfReady);

        return isPdfReady;
    }

    render() {
    //console.log("Rendering dashboard. Cache: " + sessionStorage.getItem("cache"));
        return (
            <Row type="flex" justify="center" style={{
                maxWidth: '100vw',
                minHeight: '100vh',
                background: '#F5F5F5',
                padding: '32px',
                textAlign: 'center'
            }}
            >
                <Col span={24} style={{
                    maxWidth: '1366px',
                    display: 'inline-block'
                }}>
                    <Row type="flex" justify="center">
                        <Col xxl={12} xl={12} lg={12} md={24} sm={24} xs={24} style={{ width: '590px', textAlign: "left" }}>
                            <Feedback context={this.state}/>
                        </Col>
                        <Col xxl={12} xl={12} lg={12} md={24} sm={24} xs={24} style={{ width: '590px', textAlign: "right" }} >
                            <Text style={{
                                fontFamily: 'Lato',
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                                fontSize: '16px',
                                lineHeight: '24px',
                                color: '#333333'
                            }}>
                                {this.state.userInfo.cobrandName} | MyApp Data Analytics&nbsp;&nbsp;&nbsp;
                            </Text>
                            {
                                this.state.showCustomerSelectionDropdown ?
                                    <SubbrandSelectOption currentSelection={this.state.selectedCustomer} options={this.state.customerSelectionList} updateSelectedCustomer={this.updateSelectedCustomer} />
                                    : null
                            }
                            &nbsp;&nbsp;&nbsp;
                            <PdfDownloader enabled={this.state.enablePdfDownload} 
                                           data={this.state.pdfData} 
                                           user={this.state.userInfo} 
                                           selectedCustomer = {this.state.selectedCustomer}
                                           customerList =  {this.state.customerSelectionList}              
                            />
                        </Col>
                    </Row>
                    <br />
                    <Row id='dashboard-row-1' type="flex" justify="center" >
                        <Col xxl={12} xl={12} lg={12} md={24} sm={24} xs={24} style={{
                            width: '590px',
                            paddingRight: '12px'
                        }}>
                            <Card id='report-1'style={{
                                borderRadius: '6px'
                            }}>
                                <LoginSuccessReport context={this.state} />
                            </Card>
                        </Col>
                        <Col xxl={12} xl={12} lg={12} md={24} sm={24} xs={24} style={{
                            width: '590px',
                            paddingLeft: '12px'
                        }}>
                            <Card  id='report-2' style={{
                                borderRadius: '6px'
                            }}>
                                <UserSessionLengthDistributionReport context={this.state} />
                            </Card>
                        </Col>
                    </Row>
                    <br />
                    <Row id='dashboard-row-2' type="flex" justify="center" >
                        <Col xxl={12} xl={12} lg={12} md={24} sm={24} xs={24} style={{
                            width: '590px',
                            paddingRight: '12px'
                        }}>
                            <Card  id='report-3' style={{
                                borderRadius: '6px'
                            }}>
                                <MfaSuccessByTypeReport context={this.state} />
                            </Card>
                        </Col>
                        <Col xxl={12} xl={12} lg={12} md={24} sm={24} xs={24} style={{
                            width: '590px',
                            paddingLeft: '12px'
                        }}>
                            <Card  id='report-4' style={{
                                borderRadius: '6px'
                            }}>
                                <CapturedSearchTextReport context={this.state} />
                            </Card>
                        </Col>
                    </Row>
                    <br />
                </Col>
            </Row >
        );
    }
}