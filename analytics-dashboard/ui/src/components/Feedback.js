import React, { Component } from 'react';
import { Modal, Input, Button, Icon, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import '../styles/master.css'
import * as Client from '../util/RestClientUtil';

export default class Feedback extends Component {
    static propTypes = {
        context: PropTypes.object.isRequired
    }

    state = {
        feedbackText: null,
        isFeedbackModalVisible: false,
        isThankYouModalVisible: false
    };

    setFeedbackVisible = (isVisible) => {
        this.setState({
            isFeedbackModalVisible: isVisible
        });
    }

    setThankYouVisible = (isVisible) => {
        this.setState({
            isThankYouModalVisible:  isVisible
        }); 
    }

    handleSubmit = () => {
        this.setFeedbackVisible(false);
        this.setThankYouVisible(true);

        let registerEventRequestPayload = {
            eventId: 8, 
            userInfo: this.props.context.userInfo
        }

    //console.log("Registering Event: " + JSON.stringify(registerEventRequestPayload));
        Client.dispatchRequestToRegisterEvent(registerEventRequestPayload);

        if(this.state.feedbackText != null && this.state.feedbackText !== ""){
            let emailRequestPayload = {
                content: this.state.feedbackText, 
                userInfo: this.props.context.userInfo
            }
        //console.log("Emailing Feedback: " + JSON.stringify(emailRequestPayload));
            Client.dispatchRequestForEmail(emailRequestPayload);
        }
    }

    handleDone = () => {
        this.setThankYouVisible(false);

        if (!this.props.context.showCustomerFeedbackButton) {
            let returnUrl = this.props.context.returnUrl;
        //console.log("###Return URL: " + returnUrl);
            window.location.href = returnUrl;
        }
    }

    handleCloseThankYou = () => {
    //console.log("Closing ThankYou Box");
        this.setThankYouVisible(false);

        if (!this.props.context.showCustomerFeedbackButton) {
            let returnUrl = this.props.context.returnUrl;
        //console.log("###Return URL: " + returnUrl);
            window.location.href = returnUrl;
        }

    }

    handleCloseFeedback = () => {
    //console.log("Closing Feedback Box");
        this.setFeedbackVisible(false);
        
        let registerEventRequestPayload = {
            eventId: 9, 
            userInfo: this.props.context.userInfo
        }

    //console.log("Registering Event: " + JSON.stringify(registerEventRequestPayload));
        Client.dispatchRequestToRegisterEvent(registerEventRequestPayload);

        if (!this.props.context.showCustomerFeedbackButton) {
            let returnUrl = this.props.context.returnUrl;
        //console.log("###Return URL: " + returnUrl);
            window.location.href = returnUrl;
        }
    }

    returnToHome = () => {
    //console.log("Returing to Home Page");
        let returnUrl = this.props.context.returnUrl;
    //console.log("###Return URL: " + returnUrl);
        window.location.href = returnUrl;
    }

    render() {
        return (
            <div>
                <div>
                    <Row type='flex' justify="center" align="middle">
                        <Col span={5} style={{
                            textAlign: 'left'
                        }}>
                            <Button style={{
                                paddingLeft: '0px',
                                fontFamily: 'Lato',
                                fontStyle: 'normal',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                lineHeight: '17px',
                                color: '#267CB2'
                            }}
                                type="link" onClick={() => this.props.context.showCustomerFeedbackButton ? this.returnToHome() : this.setFeedbackVisible(true)}>
                                <Icon type="arrow-left" /> Return to Home Page
                        </Button>
                        </Col>
                        <Col span={19} style={{
                            textAlign: 'left'
                        }}>
                            <button
                                hidden={!this.props.context.showCustomerFeedbackButton}
                                className = "amp-btn-primary"
                                onClick={() => this.setFeedbackVisible(true)}>
                                Share feedback
                        </button>
                        </Col>
                    </Row>
                </div>
                <div>
                    <Modal
                        centered
                        closable
                        footer={null}
                        width='883px'
                        style={
                            {
                                fontFamily: 'Lato',
                                borderRadius: '4px'

                            }
                        }
                        onCancel={this.handleCloseThankYou}
                        visible={this.state.isThankYouModalVisible}
                    >
                        <div style={{
                            padding: '32px'
                        }}>
                            <div style={{
                                fontStyle: 'normal',
                                fontWeight: 'bold',
                                fontSize: '36px',
                                lineHeight: '48px',
                                marginBottom: '16px',
                                color: '#267CB2'
                            }}>
                                Thank You!
                        </div>
                            <div style={{
                                fontStyle: 'normal',
                                fontWeight: 'bold',
                                fontSize: '20px',
                                lineHeight: '28px',
                                marginBottom: '256px',
                                color: '#747474'
                            }}>
                                We know your time is valuable and we appreciate you helping us bring you the best
                            <br />possible experience.
                        </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'flex-end'
                            }}>
                                <button type="primary" onClick={this.handleDone} className="amp-btn-primary">
                                    Done
                             </button>
                            </div>
                        </div>
                    </Modal>
                    <Modal  centered
                            closable
                            footer={null}
                            width='883px'
                            style={{
                                fontFamily: 'Lato',
                                borderRadius: '4px',

                            }}
                            onCancel={this.handleCloseFeedback}
                            visible={this.state.isFeedbackModalVisible}
                    >
                        <div style={{
                            padding: '32px'
                        }}>
                            <div style={{
                                fontStyle: 'normal',
                                fontWeight: 'bold',
                                fontSize: '36px',
                                lineHeight: '48px',
                                marginBottom: '16px',
                                color: '#267CB2'
                            }}>
                                What did you think?
                            </div>
                            <div style={{
                                fontStyle: 'normal',
                                fontWeight: 'bold',
                                fontSize: '20px',
                                lineHeight: '28px',
                                marginBottom: '32px',
                                color: '#747474'
                            }}>
                                We will implement your feedback into the alpha version redesign coming soon.
                            </div>
                            <div style={{
                            }}>
                                <Input.TextArea placeholder="Type in your feedback."
                                    autosize={{ minRows: 8, maxRows: 8 }}
                                    maxLength={500}
                                    style={{
                                        border: '1px solid #DEDEDE',
                                        boxSizing: 'border-box',
                                        borderRadius: '6px',
                                        fontStyle: 'normal',
                                        fontWeight: 'normal',
                                        fontSize: '14px',
                                        lineHeight: '17px'
                                    }}
                                    onChange={(e) => {
                                        this.setState({ 'feedbackText': e.target.value });
                                    }}
                                />
                            </div>
                            <div style={{
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                                fontSize: '12px',
                                lineHeight: '14px',
                                textAlign: 'right',
                                marginBottom: '64px',
                                marginTop: '8px'
                            }}>
                                {(this.state.feedbackText || "").length}/500
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'flex-end'
                            }}>
                                <button type="primary" onClick={this.handleSubmit} className="amp-btn-primary">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
        );
    }
}