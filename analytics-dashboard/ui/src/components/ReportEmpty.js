import React, { Component } from 'react';
import { Row, Col} from 'antd';

export default class ReportEmpty extends Component {
    render() {
    //console.log("Rendering <ChartLoader> component");
        return (
            <Row type='flex' justify="center" align="middle" style={{ height: "236px" }}>
                <Col span={24} style={{ textAlign: "center", marginBottom:'50px' }}>
                <Row type='flex' justify="space-between" align="middle" gutter={24}>
                    <Col span={8} style={{ textAlign: "right"}}>
                        <i className="fas fa-exclamation-triangle" style={{ color: "#F8A72D", fontSize:'28px'}}></i>
                    </Col>
                    <Col span={16} style={{ textAlign: "left"}}>
                        <span style={{
                            color: '#333333',
                            fontStyle: 'normal',
                            fontWeight: 'bold',
                            fontSize: '14px',
                        }}>
                            Data unavailable
                    </span>
                        <br />
                        <span style={{
                            color: '#747474',
                            fontStyle: 'normal',
                            fontWeight: 'normal',
                            fontSize: '14px',
                        
                        }}>
                            Insufficient data for generating<br />report in the given time range.  
                    </span>
                    </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}