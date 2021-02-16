import React, { Component } from 'react';
import { Row, Col, Typography, Icon, Popover } from 'antd';
import PropTypes from 'prop-types';
import { getReportSubtitleFromLastRefreshedTimeStamp } from '../util/ReportUtil';

const { Text } = Typography;

export default class ReportHeader extends Component {
    static propTypes = {
        data: PropTypes.object.isRequired,
        enabled: PropTypes.bool.isRequired,
        supplementaryData: PropTypes.object,
        timeStamp: PropTypes.string
    }

    render() {
    //    console.log("Rendering report header component with props: "+JSON.stringify(this.props));
        return (
            <div style={{height:'76px'}}>
            <Row type='flex' justify="center">
                <Col span={16} style={{
                    textAlign: 'left',
                    marginBottom: '5px'
                }}>
                    <Text style={{
                        color: this.props.enabled?'#747474':'#74747480',
                        fontFamily: 'Lato',
                        fontStyle: 'normal',
                        fontWeight: 'bold',
                        fontSize: '20px',
                        lineHeight: '28px'
                    }}>{this.props.data.title}&nbsp;&nbsp;
                        <Popover placement="bottom" 
                            content={
                                <div style={{
                                    color: '#333333',
                                    fontFamily: 'Lato',
                                    fontStyle: 'normal',
                                    fontWeight: 'normal',
                                    fontSize: '12px',
                                    lineHeight: '14px',
                                    maxWidth: '250px',
                                    minWidth:'50px',
                                    wordBreak:'break-word'
                                }}>{this.props.data.description}
                                </div>
                            }  
                            trigger="hover"
                        >
                            <Icon type="info-circle" style={{
                                fontSize: '16px',
                                lineHeight: '19px',
                                textAlign: 'right',
                                color: this.props.enabled?'#747474':'#74747480',
                            }} />
                        </Popover>
                    </Text>
                </Col>
                <Col span={8} style={{
                    textAlign: 'right'
                }}>
                    <Text style={{
                        fontFamily: 'Lato',
                        fontStyle: 'normal',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        lineHeight: '14px',
                        color: this.props.enabled?'#267CB2':'#267CB280',
                    }}>
                        {this.props.supplementaryData?this.props.supplementaryData.name.toUpperCase()+": "+this.props.supplementaryData.value:""}
                    </Text>
                </Col>
            </Row>
             <Row type='flex' justify="center">
                <Col span={24} style={{
                    textAlign: 'left',
                    marginBottom: '5px'
                }}>
                    <Text style={{
                          fontFamily: 'Lato',
                          fontStyle: 'normal',
                          fontWeight: 'normal',
                          fontSize: '12px',
                          lineHeight: '12px',
                          color: this.props.enabled?'#747474':'#74747480',
                        }}>{this.props.timeStamp !== null && this.props.timeStamp !== undefined?getReportSubtitleFromLastRefreshedTimeStamp(this.props.timeStamp):""}
                    </Text>
                </Col>
            </Row>
            <br />
        </div>
        );
    }
}