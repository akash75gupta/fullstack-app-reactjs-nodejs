import React, { Component } from 'react';
import { Row, Col } from 'antd';

export default class Error extends Component {
    render() {
    //console.log("Rendering <Error> component");
        return (
            <Row type='flex' justify="center" align="middle" style={{
                maxWidth: '100vw',
                minHeight: '100vh',
                background: '#F5F5F5',
                textAlign: 'center'
            }}>
                <Col span={24} style={{
                    maxWidth: '1366px',
                    display: 'inline-block',
                    textAlign: "center",
                    marginBottom: '50px'
                }
                }>
                    <Row type='flex' justify="center" align="middle" gutter={24}>
                        <Col span={11} style={{ textAlign: "right" }}>
                            <i className="fad fa-spinner-third fa-spin" style={{ color: "#267CB2", fontSize: 28 }}></i>
                        </Col>
                        <Col span={13} style={{ textAlign: "left" }}>
                            <span style={{
                                color: '#333333',
                                fontStyle: 'normal',
                                fontWeight: 'bold',
                                fontSize: '14px',
                            }}>
                                Application Loading
                            </span>
                            <br />
                            <span style={{
                                color: '#747474',
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                                fontSize: '14px',

                            }}>
                                Please stay tuned.
                            </span>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}