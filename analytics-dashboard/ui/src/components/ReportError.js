import React, { Component } from 'react';
import { Row, Col} from 'antd';

export default class ReportError extends Component {
    render() {
    //console.log("Rendering <ChartLoader> component");
        return (
            <Row type='flex' justify="center" align="middle" style={{ height: "236px" }}>
                <Col span={24} style={{ textAlign: "center", marginBottom:'50px' }}>
                <Row type='flex' justify="space-between" align="middle" gutter={24}>
                    <Col span={8} style={{ textAlign: "right"}}>
                        <i className="fas fa-exclamation-triangle" style={{ color: "#FF3A67", fontSize:'28px'}}></i>
                    </Col>
                    <Col span={16} style={{ textAlign: "left"}}>
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
                            Oops! Something&apos;s gone wrong.<br /> Please refresh the page<br />or check back later.
                    </span>
                    </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}