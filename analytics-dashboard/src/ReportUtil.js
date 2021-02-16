import * as logger from './LoggerUtil';
import * as Config from './Config.js';

import underscore from 'underscore';

export let getReportSpecification = (reportId) =>{
    logger.logInfo("Executing ReportUtil.getReportSpecification() with Param 1- reportId: "+reportId);
    let specification = {};

    let report = Config.REPORT_METADATA[reportId];

    //deep copying report object
    let reportCopy = JSON.parse(JSON.stringify(report));

    specification.id = reportCopy.id;
    specification.type = reportCopy.type;
    specification.query = reportCopy.query
        
    logger.logInfo("Returning from ReportUtil.getReportSpecification() - value: " + JSON.stringify(specification));
    return specification;
}

export function getDropOffCounts(amplitudeDropOffCounts) {
    logger.logInfo("Executing ReportUtil.getDropOffCounts() with Param 1- amplitudeDropOffCounts: "+amplitudeDropOffCounts);
    let dropOffCounts = [];
    let numberOfKeys = Object.keys(amplitudeDropOffCounts).length;

    for(let i=0; i<numberOfKeys; i++){
        dropOffCounts.push(amplitudeDropOffCounts[i]);
    }

    logger.logInfo("Returning from ReportUtil.getDropOffCounts() with Param 1- amplitudeDropOffCounts: "+JSON.stringify(dropOffCounts));

    return dropOffCounts;
}

export function getSuccessCounts(amplitudeCumulativeRaw) {
    logger.logInfo("Executing ReportUtil.getSuccessCounts() with Param 1- amplitudeCumulativeRaw: "+JSON.stringify(amplitudeCumulativeRaw));
    let successCounts = amplitudeCumulativeRaw;
    logger.logInfo("Executing ReportUtil.getSuccessCounts() with value: "+successCounts);
    return successCounts;
  
}


export function getCategories(amplitudeEvents) {
    logger.logInfo("Executing ReportUtil.getSuccessCounts() with Param 1- amplitudeCumulativeRaw: "+JSON.stringify(amplitudeEvents));
    let categories = amplitudeEvents;
    logger.logInfo("Executing ReportUtil.getSuccessCounts() with value="+categories);
    return categories;
  
}

export function getSeriesLabels(amplitudeSeriesLabels) {
    logger.logInfo("Executing ReportUtil.getSeriesLabels() with Param 1- amplitudeSeriesLabels: "+JSON.stringify(amplitudeSeriesLabels));
    let seriesLabels = [];
    if(amplitudeSeriesLabels === null){
        throw Error("Series Labels in segment data is null");
    }

    for(let label of amplitudeSeriesLabels){
        seriesLabels.push(label[1]);
    }

    logger.logInfo("Returning from ReportUtil.getSeriesLabels() with value: "+JSON.stringify(seriesLabels));
    return seriesLabels;
}

export function getSeriesValues(amplitudeSeriesCollapsed) {
    logger.logInfo("Executing ReportUtil.getSeriesValues() with Param 1: amplitudeSeriesCollapsed="+JSON.stringify(amplitudeSeriesCollapsed));
    let seriesValues = [];
    if(amplitudeSeriesCollapsed === null){
        throw Error("Series Collapsed in segment data is null");
    }

    for(let collapse of amplitudeSeriesCollapsed){
        seriesValues.push(collapse[0].value);
    }

    logger.logInfo("Returning from ReportUtil.getSeriesLabels() with value: "+JSON.stringify(seriesValues));
    return seriesValues;
}

export function getSeries(amplitudeSegmentData) {
    logger.logInfo("Executing ReportUtil.getSeries() with Param 1: amplitudeSegmentData="+JSON.stringify(amplitudeSegmentData));
    let series = [];
    let labels = getSeriesLabels(amplitudeSegmentData.seriesLabels);
    let values = getSeriesValues(amplitudeSegmentData.seriesCollapsed);

    let labelsRequired =  false;
    if(labels.length === values.length){
        labelsRequired = true;
    }
    
    for(let i=0; i< values.length;i++){
        let element = {
            name:  labelsRequired? labels[i]:"",
            value: values[i]
        }
        series.push(element);
    }
   
    logger.logInfo("Executing ReportUtil.getSeries() with value: "+series);
    return series;
}

  export let parseFunnelReport = (customer, reportId, report) => {
    logger.logInfo("------------------------------------------------------------------------");
    logger.logInfo("Executing ReportUtil.parseFunnelReport() with");
    logger.logInfo("Param 1- customer: "+ JSON.stringify(customer));
    logger.logInfo("Param 2- reportId: "+ reportId);
    logger.logInfo("Param 3- report: "+ JSON.stringify(report));

    if(typeof report === 'string'){
      report = JSON.parse(report);
    }

    let parsedReport = null;  
    if (!underscore.has(report, "data")) {
      logger.logInfo("Data key not found in report response.");
      logger.logInfo("Invalid query call. Please check the query.");
      parsedReport = {
        data: new Error("Invalid query call. Please check the query."),
        message: "Error fetching reports",
        status: -1
      }
    }else{
      let responseData = report.data;
      
      if (typeof responseData != typeof []) {
        logger.logInfo("Invalid report data format.");
        parsedReport = {
          data: new Error("Invalid report data format."),
          message: "Error fetching reports",
          status: -1
        }
      }else if (underscore.isEqual(responseData, [])) {
        logger.logInfo("Data not available for the given customer.");
        parsedReport = {
          data: {},
          message: "No data found.",
          status: 1
        };
      }else {
        logger.logInfo("Data found for the given customer.");
        parsedReport = {
          data: {
            "categories":getCategories(responseData[0].events),
            "stacks":[{
            "name":'A',
            "dropOff": {
              name: "DROPOFF",
              counts: getDropOffCounts(responseData[0].dropoffCounts)
            },
            "success": {
              name: "ALL USERS",
              counts: getSuccessCounts(responseData[0].cumulativeRaw)
             }
            }],
            "medians":responseData[0].medianTransTimes,
            "cumulativeDrops":responseData[0].cumulative,
            "stepDrops":responseData[0].stepByStep
          },
          message: "Reports fetched successfully.",
          status: 1
        }
      }
    }
    logger.logInfo("##############################################################################################");
    logger.logInfo("Returning from ReportUtil.parseFunnelReport() with value: "+JSON.stringify(parsedReport));
    logger.logInfo("##############################################################################################");
  
    return parsedReport;
  }

  export function parseSegmentReport(customer, reportId, report){
    logger.logInfo("------------------------------------------------------------------------");
    logger.logInfo("Executing ReportUtil.parseSegmentReport() with");
    logger.logInfo("Param 1- customer: "+ JSON.stringify(customer));
    logger.logInfo("Param 2- reportId: "+ reportId);
    logger.logInfo("Param 3- report: "+ JSON.stringify(report));

    if(typeof report === 'string'){
      report = JSON.parse(report);
    }
 
    let parsedReport = null;  
    if (!underscore.has(report, "data")) {
      logger.logInfo("Data key not found in report response.");
      logger.logInfo("Invalid query call. Please check the query.");
      parsedReport = {
        data: new Error("Invalid query call. Please check the query."),
        message: "Error fetching reports",
        status: -1
      }
    }else{
      let responseData = report.data;
      if (typeof responseData != typeof {}) {
        logger.logInfo("Invalid report data format.");
        parsedReport = {
          data: new Error("Invalid report data format."),
          message: "Error fetching reports",
          status: -1
        }
      }else if (underscore.isEqual(responseData, {}) || underscore.isEqual(responseData.seriesCollapsed, [])) {
        logger.logInfo("Data not available for the given customer.");
        parsedReport = {
          data: {},
          message: "No data found.",
          status: 1
        };
      } else {
        logger.logInfo("Data found for the given customer.");
        parsedReport = {
          data: {
            "series":getSeries(responseData)
          },
          message: "Reports fetched successfully.",
          status: 1
        }
      }
    }
    logger.logInfo("##############################################################################################");
    logger.logInfo("Returning from ReportUtil.parseSegmentReport() with value: "+JSON.stringify(parsedReport));
    logger.logInfo("##############################################################################################");
  
    return parsedReport;
  }

  export function parseSessionReport(customer, reportId, report){
    logger.logInfo("------------------------------------------------------------------------");
    logger.logInfo("Executing ReportUtil.parseSessionReport() with");
    logger.logInfo("Param 1- customer: "+ JSON.stringify(customer));
    logger.logInfo("Param 2- reportId: "+ reportId);
    logger.logInfo("Param 3- report: "+ JSON.stringify(report));
    
    if(typeof report === 'string'){
      report = JSON.parse(report);
    }

    let parsedReport = null;
    if (!underscore.has(report, "data")) {
      logger.logInfo("Data key not found in report response.");
      logger.logInfo("Invalid query call. Please check the query.");
      parsedReport = {
        data: new Error("Invalid query call. Please check the query."),
        message: "Error fetching reports",
        status: -1
      }
    }else{
      let responseData = report.data;
      if (typeof responseData != typeof []) {
        logger.logInfo("Invalid report data format.");
          parsedReport = {
          data: new Error("Invalid report data format."),
          message: "Error fetching reports",
          status: -1
        }
      }else if (underscore.isEqual(responseData, []) || responseData.series[0][0] instanceof Object) {
        logger.logInfo("Data not available for the given customer.");
        parsedReport = {
          data: {},
          message: "No data found.",
          status: 1
        };
      }else {
        logger.logInfo("Data found for the given customer.");
        try{
          parsedReport = {
            data: {
              "series":getSessions(responseData),
            },
            message: "Reports fetched successfully.",
            status: 1
         }
        }catch(error){
          logger.logInfo("###Error - Parsing Session Response");
          logger.logError(error);
        }
      }
    }
    logger.logInfo("##############################################################################################");
    logger.logInfo("Returning from ReportUtil.parseSessionReport() with value: " + JSON.stringify(parsedReport));
    logger.logInfo("##############################################################################################");

    return parsedReport;
  }

  
export function getSessions(sessionData) {
  logger.logInfo("Executing ReportUtil.getSessions() with Param 1: sessionData="+JSON.stringify(sessionData));
  let series = [];
  let labels = getSessionLabels(sessionData.xValues);
  let values = getSessionValues(sessionData.series[0]);

  let labelsRequired =  false;
  if(labels.length === values.length){
      labelsRequired = true;
  }
  
  for(let i=0; i< values.length;i++){
      let element = {
          name:  labelsRequired? labels[i]:"",
          value: values[i]
      }
      series.push(element);
  }
 
  logger.logInfo("Executing ReportUtil.getSessions() with value="+JSON.stringify(series));
  return series;
}

export function getSessionLabels(labels){
  logger.logInfo("Executing ReportUtil.getSessionLabels() with Param 1: labels="+JSON.stringify(labels));
  let seriesLabels = [];
  if(labels === null){
      throw Error("Session labels are null");
  }

  for(let label of labels){
      seriesLabels.push(label);
  }

  logger.logInfo("Returning from ReportUtil.getSeriesLabels() with value="+JSON.stringify(seriesLabels));
  return seriesLabels;
}

export function getSessionValues(values){
  logger.logInfo("Executing ReportUtil.getSessionValues() with Param 1: values="+JSON.stringify(values));
  let sessionValues = [];
  if(values === null){
      throw Error("Session values are null");
  }

  for(let value of values){
      sessionValues.push(value);
  }

  logger.logInfo("Returning from ReportUtil.getSessionValues() with value="+JSON.stringify(sessionValues));
  return sessionValues;
}

export function isValidResponse(response){
  logger.logInfo("ReportUtil.isValidResponse() Validating response status : "+JSON.stringify(response));
  if (response.statusCode === 200) {
    return true;
  }else{
    return false;
  }
}