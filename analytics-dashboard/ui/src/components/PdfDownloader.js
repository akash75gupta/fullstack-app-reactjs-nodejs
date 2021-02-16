import React, { Component } from 'react';
import PropTypes from 'prop-types'
import PdfDocument from './PdfDocument';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Popover, Icon, Spin, Row, Col } from 'antd';

export default class PdfDownloader extends Component {
    static propTypes = {
        enabled: PropTypes.bool.isRequired,
        user: PropTypes.object.isRequired,
        data: PropTypes.array,
        selectedCustomer: PropTypes.string,
        customerList: PropTypes.array
    }
    render() {
    //console.log("Rendering <PdfDownloader />");
        return (
            this.props.enabled?<PDFDownloadLink
                                            document={<PdfDocument 
                                                            data={this.props.data} 
                                                            user={this.props.user} 
                                                            selectedCustomer={this.props.selectedCustomer}
                                                            customerList={this.props.customerList}
                                                    />}
                                            fileName="analytics_dashboard.pdf"
                                          ><Popover placement="top" 
                                          content={
                                              <div style={{
                                                  color: '#333333',
                                                  fontFamily: 'Lato',
                                                  fontStyle: 'normal',
                                                  fontWeight: 'normal',
                                                  fontSize: '12px',
                                                  lineHeight: '14px',
                                                  maxWidth: '200px',
                                                  minWidth:'200px',
                                                  wordBreak:'break-word'
                                              }}>
                                                  <Row type='flex' justify="center" align="middle" gutter={24}>
                                                          <Col span={4} style={{ textAlign: "right"}}>
                                                              <Spin indicator={<Icon type="check-circle" theme="filled" style={{
                                                                  color:'#29A87C',
                                                                  fontSize:'12px' 
                                                              }}/>}></Spin>
                                                          </Col>
                                                          <Col span={20} style={{ textAlign: "left"}}>
                                                              <span >PDF ready for download</span>
                                                          </Col>
                                                      </Row>
                                              </div>
                                          }     
                                          trigger="hover"
                                      ><i className="far fa-download" style={{ color: "#267CB2", fontSize:'16px'}}></i>
                                      </Popover>
                                          </PDFDownloadLink>
                                        :  <Popover placement="top" 
                                            content={
                                                <div style={{
                                                    color: '#333333',
                                                    fontFamily: 'Lato',
                                                    fontStyle: 'normal',
                                                    fontWeight: 'normal',
                                                    fontSize: '12px',
                                                    lineHeight: '14px',
                                                    maxWidth: '200px',
                                                    minWidth:'200px',
                                                    wordBreak:'break-word'
                                                }}>
                                                    <Row type='flex' justify="center" align="middle" gutter={24}>
                                                            <Col span={4} style={{ textAlign: "right"}}>
                                                                <Spin indicator={<Icon type='loading' style={{
                                                                    fontSize:'12px' 
                                                                }}spin/>}></Spin>
                                                            </Col>
                                                            <Col span={20} style={{ textAlign: "left"}}>
                                                                <span>Preparing PDF for download</span>
                                                            </Col>
                                                        </Row>
                                                </div>
                                            }     
                                            trigger="hover"
                                        ><i className="far fa-download" style={{color: "#DEDEDE", fontSize:'16px'}}></i>
                                        </Popover>
        );
    }
}
