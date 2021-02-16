import React, { Component } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import PropTypes from 'prop-types';

import { Row, Col} from 'antd';

export default class StackedColumnChart extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    reportId: PropTypes.string.isRequired
  }
    getHighChartConfig = () => {
    //    console.log("Executing StackedColumnChart.getHighChartConfig()");
        const options = {
        chart: {
            type: 'column',
            height:'236px',
            style:{
              fontFamily: 'Lato',
              position:'relative'
            }
        },
        exporting: { enabled: false },
        credits: {
            enabled: false
        },
        colors: [
            '#DEDEDE',
            '#267CB2'
        ],
        title: {
          text:null
        },
        xAxis: {
            categories: this.props.data.categories,
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
            labels: {
                formatter: function() {
                   return this.value;
                }
              }        
        },
        tooltip: {
            enabled: false ,
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
            shared: true
        },
        plotOptions: {
            column: {
                stacking: 'column'
            }
        },
        legend: {
            enabled:true,
            align: 'left',
            verticalAlign: 'bottom',
            layout: 'horizontal',
            alignColumns:true,
            shadow: false,
            itemStyle:{
                'font-style': 'normal',
                'font-weight': 'bold',
                'font-size': '12px',
                'line-height': '14px',
                'letter-spacing': '2px',
                'align-items': 'center',
                'text-transform': 'uppercase',
                'color': '#747474'
            }
        },
        series: []
    }

    if(this.props.reportId === "MYAPP_MFA_SUCCESS_BY_TYPE"){
        options.legend.enabled = false;
        options.yAxis.labels.formatter = function() {
               return this.value+"%";
        };
        options.plotOptions.column.stacking = 'percent';      
    }
  
    let labels= {
        enabled: true,
        format: '{point.y}',
        style: {
            fontFamily: 'Lato',
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontSize: '12px',
            lineHeight: '14px',
            textOutline: '0px',
            color: '#FFFFFF'
        }
    };

    let stacks = this.props.data.stacks;

    for(let i=0; i<stacks.length; i++){
        let seriesElement = null;
        let data = null;

        if(this.props.reportId === "MYAPP_MFA_SUCCESS_BY_TYPE"){
            data = this.assignColorToDropOffData(this.props.data.stacks[i].dropOff.counts);
        }else{
            data = this.props.data.stacks[i].dropOff.counts;
        }

        seriesElement =   {
            name: this.props.data.stacks[i].dropOff.name,
            data: data,
            stack: i     
        };
        options.series.push(seriesElement);
      
        if(this.props.reportId === "MYAPP_MFA_SUCCESS_BY_TYPE"){
            data = this.assignColorToSuccessData(this.props.data.stacks[i].success.counts)
        }else{
            data = this.props.data.stacks[i].success.counts;
        }

        seriesElement = {
            name: this.props.data.stacks[i].success.name,
            data: data,
            dataLabels: labels,
            stack: i     
        }
       
        options.series.push(seriesElement);
    }

  //  console.log("Returning from StackedColumnChart.getHighChartConfig() with value: "+JSON.stringify(options));

    return options;
  }

  assignColorToDropOffData = (values) => {
    //  console.log("Executing StackedColumnChart.assignColorToDropOffData() with Param 1: values= "+JSON.stringify(values));
      let coloredValues = [];

      for(let value of values){
        let coloredValue = {
            y:value,
            color:'#DEDEDE'
        }
        coloredValues.push(coloredValue);
      }
    
    //  console.log("Returning from StackedColumnChart.assignColorToDropOffData() with value= "+JSON.stringify(coloredValues));

      return coloredValues;
  }

  assignColorToSuccessData = (values) => {
  //  console.log("Executing StackedColumnChart.assignColorToSuccessData() with Param 1: values= "+JSON.stringify(values));
    let coloredValues = [];
    let colorsPalette = ["#267CB2", "#FF3A67", "#0096D6", "#29A87C"];

    for(let i=0; i<values.length; i++){
      let coloredValue = {
          y:values[i],
          color:colorsPalette[i]
      }
      coloredValues.push(coloredValue);
    }
  
   // console.log("Returning from StackedColumnChart.assignColorToSuccessData() with value= "+JSON.stringify(coloredValues));

    return coloredValues;
  }

  render() {
  //  console.log("Rendering <StackedColumnChart> component for report Id: "+this.props.reportId+" with data: "+JSON.stringify(this.props.data)) ;
    const options = this.getHighChartConfig();
    return (
        <Row type='flex' justify="center" align="middle">
            <Col span={24} style={{ textAlign: "center" }}>
                <HighchartsReact highcharts={Highcharts} options={options} />
            </Col>
        </Row>
    );
  }
}