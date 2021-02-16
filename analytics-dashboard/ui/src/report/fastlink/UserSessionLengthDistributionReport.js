import React, { Component } from 'react';
import ColumnChart from '../../chart/ColumnChart';
import * as Config from '../../config/Config';
import * as ProjectUtil from '../../util/ProjectUtil';
import * as ReportUtil from '../../util/ReportUtil';
import ReportHeader from '../../components/ReportHeader';
import ReportError from '../../components/ReportError';
import ReportEmpty from '../../components/ReportEmpty';
import { Row, Col} from 'antd';
import ChartLoader from '../../components/ChartLoader';
import * as Constants from '../../config/Constants';
import underscore from 'underscore';
import PropTypes from 'prop-types';

export default class UserSessionLengthDistributionReport extends Component {
  static propTypes = {
    context: PropTypes.object.isRequired
  }

  constructor(props) {
    //console.log("Constructing <UserSessionLengthDistributionReport>.");
    super(props);
    let reportSpecification = ProjectUtil.getReportSpecification(Config.DEFAULT_PROJECT, Config.MYAPP_REPORT_2);
    this.state = {
      header:{
        id: reportSpecification.report.id,
        title: reportSpecification.report.title,
        frequency: reportSpecification.report.frequency,
        period: reportSpecification.report.timePeriod,
        description: reportSpecification.report.description
      }
    };
  }

  render() {
    let fetchedReport = ReportUtil.findReportById(Config.MYAPP_REPORT_2, this.props.context.reports);
    //console.log("Rendering <UserSessionLengthDistributionReport> for fetchedReport: "+JSON.stringify(fetchedReport));
    let reportLastRefreshedTimestamp = null;
    let returnJsx = null;
    let headerEnabled = true;
    if(underscore.isEqual(fetchedReport.status, Constants.REPORT_ERROR_STATUS)){
      headerEnabled = false;
      returnJsx = <ReportError />;
    }else if (underscore.isEqual(fetchedReport.status, Constants.REPORT_DEFAULT_STATUS)) {
      headerEnabled = false;
      returnJsx =  <ChartLoader />;
    } else if(underscore.isEqual(fetchedReport.status, Constants.REPORT_SUCCESS_STATUS)){
        if(underscore.isEqual(fetchedReport.data, {})){
          headerEnabled = false;
          reportLastRefreshedTimestamp = fetchedReport.lastRefreshTimestamp;
          returnJsx = <ReportEmpty />
        }else{
          reportLastRefreshedTimestamp = fetchedReport.lastRefreshTimestamp;
          returnJsx = <ColumnChart data={fetchedReport.data} reportId = {this.state.header.id} />
        }
    }
    return (
      <Row type='flex' justify="center">
        <Col span={24}>
          <ReportHeader data={this.state.header} 
                        enabled={headerEnabled} 
                        timeStamp={reportLastRefreshedTimestamp}
          />
          {returnJsx}
        </Col>
      </Row>
    );
  }
}