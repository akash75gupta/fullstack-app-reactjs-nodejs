import React, { Component } from 'react';
import PropTypes from 'prop-types'

import { Page, View, Document, StyleSheet, Image, Font, Text } from '@react-pdf/renderer';

import * as ProjectUtil from '../util/ProjectUtil';
import * as Config from '../config/Config';
import * as CustomerUtil from '../util/CustomerUtil';

import font from '../css/Lato-Regular.ttf';
import logo from '../logo.png';

// Register font
Font.register({ family: 'Lato', src: font, fontStyle: 'normal', fontWeight: 'normal' });

// Reference font
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#FFFFFF',
        padding:64
    }
});

export default class PdfDocument extends Component {
    static propTypes = {
        data: PropTypes.array.isRequired,
        user: PropTypes.object.isRequired,
        selectedCustomer: PropTypes.string.isRequired,
        customerList:PropTypes.array.isRequired
    }

    render() {
    //console.log("Rendering <PdfDocument>");
        const {user,selectedCustomer, customerList} = this.props;
        const cobrandName = user.cobrandName;
        const customer = CustomerUtil.getCustomerById(selectedCustomer, customerList);

        let data = this.props.data;

        let report1 = data[0];
        let report2 = data[1];
        let report3 = data[2];
        let report4 = data[3];

        let report1Specification = ProjectUtil.getReportSpecification(Config.DEFAULT_PROJECT, Config.MYAPP_REPORT_1);
        let report1Description   = report1Specification.report.description;
        let report2Specification = ProjectUtil.getReportSpecification(Config.DEFAULT_PROJECT, Config.MYAPP_REPORT_2);
        let report2Description   = report2Specification.report.description;
        let report3Specification = ProjectUtil.getReportSpecification(Config.DEFAULT_PROJECT, Config.MYAPP_REPORT_3);
        let report3Description   = report3Specification.report.description;
        let report4Specification = ProjectUtil.getReportSpecification(Config.DEFAULT_PROJECT, Config.MYAPP_REPORT_4);
        let report4Description   = report4Specification.report.description;

        const date = new Date();
        const reportDate =  date.toLocaleString('default', { month: 'long' })
                            +" "+date.getDate('default')
                            +" at "+ date.toLocaleString('default', { timeStyle: 'short', hour12: true });
        return (
            <Document>
            <Page size={{
                width: 1484,
                height: 1188
            }} style={styles.page}>
                <View style={{
                    display:'flex',
                    flexDirection:'row',
                    justifyContent: 'space-between',
                    alignItems:'center',
                    marginBottom:16
                }}>
                    <View style={{
                        display:'flex',
                        flexDirection:'column',
                        justifyContent: 'center',
                        alignItems:'flex-start',
                        width:576,
                        marginLeft:64
                    }}>
                        <Image src={logo} style={{width:194}}></Image>
                    </View>
                    <View style={{
                        display:'flex',
                        flexDirection:'column',
                        justifyContent: 'center',
                        alignItems:'flex-end',
                        width:576,
                        marginRight:64
                    }}>
                        <Text style={{
                                fontFamily: 'Lato',
                                color:'#333333',
                                marginBottom: 8,
                                fontSize:20
                        }}>{cobrandName} - {customer.name} | MyApp Analytics
                        </Text>
                        <Text style={{
                                fontFamily: 'Lato',
                                color:'#333333',
                                fontSize:16
                               
                        }}>Exported {reportDate}
                        </Text>
                    </View>
                </View >
                <View style={{
                          display:'flex',
                          flexDirection:'row',
                          justifyContent: 'space-around',
                          alignItems:'center',
                          marginBottom:16
                }}>
                    <View style={{
                        display:'flex',
                        flexDirection:'column',
                        justifyContent: 'space-evenly',
                        alignItems:'center',
                        width:576
                    }}>
                        <Image src={report1} style={{width:591, height:360}}></Image>
                        <Text style={{
                                fontFamily: 'Lato', 
                                color:'#333333',
                                fontSize:16,
                                marginLeft:5,
                                paddingTop:16
                        }}>{report1Description}</Text> 
                    </View>
                    <View style={{
                        display:'flex',
                        flexDirection:'column',
                        justifyContent:'space-evenly',
                        alignItems:'center',
                        width:576
                    }}>
                        <Image src={report2} style={{width:591, height:360}}></Image>
                        <Text style={{
                            fontFamily: 'Lato', 
                            color:'#333333',
                            fontSize:16,
                            marginLeft:5,
                            paddingTop:16
                        }}>{report2Description}</Text>
                    </View>
                </View>
                <View style={{
                          display:'flex',
                          flexDirection:'row',
                          justifyContent: 'space-around',
                          alignItems:'center',
                          marginBottom:16
                }}>
                     <View style={{
                        display:'flex',
                        flexDirection:'column',
                        justifyContent: 'space-evenly',
                        alignItems:'center',
                        width:576
                    }}>
                        <Image src={report3} style={{width:591, height:360}}></Image>
                        <Text style={{
                             fontFamily: 'Lato', 
                             color:'#333333',
                             fontSize:16,
                             marginLeft:5,
                             paddingTop:16
                        }}>{report3Description}</Text>
                    </View>
                    <View style={{
                        display:'flex',
                        flexDirection:'column',
                        justifyContent: 'space-evenly',
                        alignItems:'center',
                        width:576
                    }}>
                        <Image src={report4} style={{width:591, height:360}}></Image>
                        <Text style={{ 
                            fontFamily: 'Lato',
                            color:'#333333',
                            fontSize:16,
                            marginLeft:5,
                            paddingTop:16
                        }}>{report4Description}</Text>
                    </View>
                </View>
            </Page>
        </Document>
        );
    }
}