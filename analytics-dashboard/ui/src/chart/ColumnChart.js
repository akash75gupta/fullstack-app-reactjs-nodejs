/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsExporting from 'highcharts/modules/exporting';
import * as Config from '../config/Config';
import { Row, Col, Spin, Icon } from 'antd';
import PropTypes from 'prop-types';

if (typeof Highcharts === 'object') {
  HighchartsExporting(Highcharts)
}

export default class ColumnChart extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    reportId: PropTypes.string.isRequired
  }

  getHighChartConfig() {
    let options = {
      credits: {
        enabled: false
      },
      exporting: { enabled: false },
      chart: {
        type: 'column',
        height: '236px',
        style:{
          fontFamily: 'Lato',
          position:'relative'
        }
      },
      title:{
        text:null
      },
      plotOptions: {
        column: {
          colorByPoint: false,
          dataLabels: {
            enabled: true,
            format: '{point.y}',
            crop: false,
            overflow: 'none',
            style: {
              fontStyle: 'normal',
              fontWeight: 'normal',
              fontSize: '12px',
              lineHeight: '14px',
              color: '#747474'
           }
          }
        }
      },
      colors: [
        '#267CB2'
      ],
      legend: {
        enabled: false,
        itemStyle:{
          'font-style': 'normal',
          'font-weight': 'bold',
          'font-size': '12px',
          'line-height': '14px',
          'letter-spacing': '2px',
          'text-transform': 'uppercase',
          'color': '#747474'
       }
      },
      xAxis: {
        type: 'category',
        tickWidth: 1,
        labels:{
          style:{
              fontStyle: 'normal',
              fontWeight: 'normal',
              fontSize: '12px',
              lineHeight: '16px',
              color: '#747474'
          }
        }
      },
      yAxis: {
        title: {
          enabled: false
        },
        min: 0,
        lineWidth: 1,
        tickWidth: 1,
        gridLineWidth: 0, 
        allowDecimals:false
      },
      tooltip: {
        enabled: false
      },
      series: [
        {
          data: []
        }
      ]
    };

    const series = this.props.data.series;

    if (series === undefined || series === null) {
      throw new Error("Colmun Chart data series is null or undefined");
    }

    let count = series.length;

    if(this.props.reportId === Config.MYAPP_REPORT_4){
      if(count > 6){
        count = 6;
      }
    }
  
    for (let i=0; i < count; i++) {
        options.series[0].data.push({
          name: series[i].name,
          y: series[i].value,
          style: {
            color: '#2F80ED',
            fontFamily: 'Lato',
          }
        });
    }

  //  console.log("Returning from ColumnChart.getHighChartConfig()- value:" + JSON.stringify(options));

    return options;
  }

  render() {
   // console.log("Rendering <ColumnChart> component with data: "+JSON.stringify(this.props.data));
    const options = this.getHighChartConfig();

    if (options === null) {
      return (
        <Row type='flex' justify="center" align="middle" style={{ height: "200px" }}>
          <Col span={12} style={{ textAlign: "center" }}>
            <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} tip="Loading...">
            </Spin>
          </Col>
        </Row>
      )
    }

    return (
        <HighchartsReact highcharts={Highcharts} options={options}/>
    );
  }
}