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
                        <Col span={10} style={{ textAlign: "right" }}>
                        <i className="fas fa-exclamation-triangle" style={{ color: "#FF3A67", fontSize:'28px'}}></i>
                        </Col>
                        <Col span={14} style={{ textAlign: "left" }}>
                            <span style={{
                                color: '#333333',
                                fontStyle: 'normal',
                                fontWeight: 'bold',
                                fontSize: '14px',
                            }}>
                                Server Error
                            </span>
                            <br />
                            <span style={{
                                color: '#747474',
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                                fontSize: '14px',

                            }}>
                                Oops! Something&apos;s gone wrong.<br /> Please refresh the page or, try again later.
                            </span>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}