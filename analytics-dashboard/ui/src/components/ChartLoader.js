import React, { Component } from 'react';
import { Row, Col, Spin, Icon } from 'antd';

export default class ChartLoader extends Component {
    render() {
    //console.log("Rendering <ChartLoader> component");
        return (
            <Row type='flex' justify="center" align="middle" style={{ height: "236px" }}>
                <Col span={24} style={{ textAlign: "center", marginBottom:'50px' }}>
                <Row type='flex' justify="space-between" align="middle" gutter={24}>
                    <Col span={8} style={{ textAlign: "right"}}>
                    <i className="fad fa-spinner-third fa-spin" style={{ color: "#267CB2", fontSize: 24 }}></i>
                    </Col>
                    <Col span={16} style={{ textAlign: "left"}}>
                        <span style={{
                            color: '#333333',
                            fontStyle: 'normal',
                            fontWeight: 'bold',
                            fontSize: '14px',
                        }}>
                            Loading Report
                    </span>
                        <br />
                        <span style={{
                            color: '#747474',
                            fontStyle: 'normal',
                            fontWeight: 'normal',
                            fontSize: '14px',
                        
                        }}>
                            Fetching Data from MyApp.
                    </span>
                    </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}