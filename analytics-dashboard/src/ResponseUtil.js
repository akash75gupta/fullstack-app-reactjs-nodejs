import underscore from 'underscore';
import * as logger from './LoggerUtil';

export function getDropOffCounts(amplitudeDropOffCounts) {
    logger.logInfo("Executing ResponseUtil.getDropOffCounts() with Param 1: amplitudeDropOffCounts="+amplitudeDropOffCounts);
    let dropOffCounts = [];
    let numberOfKeys = Object.keys(amplitudeDropOffCounts).length;

    for(let i=0; i<numberOfKeys; i++){
        dropOffCounts.push(amplitudeDropOffCounts[i]);
    }

    logger.logInfo("Returning from ResponseUtil.getDropOffCounts() with Param 1: amplitudeDropOffCounts="+JSON.stringify(dropOffCounts));

    return dropOffCounts;
}

export function getSuccessCounts(amplitudeCumulativeRaw) {
    logger.logInfo("Executing ResponseUtil.getSuccessCounts() with Param 1: amplitudeCumulativeRaw="+JSON.stringify(amplitudeCumulativeRaw));
    let successCounts = amplitudeCumulativeRaw;
    logger.logInfo("Executing ResponseUtil.getSuccessCounts() with value="+successCounts);
    return successCounts;
  
}


export function getCategories(amplitudeEvents) {
    logger.logInfo("Executing ResponseUtil.getSuccessCounts() with Param 1: amplitudeCumulativeRaw="+JSON.stringify(amplitudeEvents));
    let categories = amplitudeEvents;
    logger.logInfo("Executing ResponseUtil.getSuccessCounts() with value="+categories);
    return categories;
  
}

export function getSeriesLabels(amplitudeSeriesLabels) {
    logger.logInfo("Executing ResponseUtil.getSeriesLabels() with Param 1: amplitudeSeriesLabels="+JSON.stringify(amplitudeSeriesLabels));
    let seriesLabels = [];
    if(amplitudeSeriesLabels === null){
        throw Error("Series Labels in segment data is null");
    }

    for(let label of amplitudeSeriesLabels){
        seriesLabels.push(label[1]);
    }

    logger.logInfo("Returning from ResponseUtil.getSeriesLabels() with value="+JSON.stringify(seriesLabels));
    return seriesLabels;
}

export function getSeriesValues(amplitudeSeriesCollapsed) {
    logger.logInfo("Executing ResponseUtil.getSeriesValues() with Param 1: amplitudeSeriesCollapsed="+JSON.stringify(amplitudeSeriesCollapsed));
    let seriesValues = [];
    if(amplitudeSeriesCollapsed === null){
        throw Error("Series Collapsed in segment data is null");
    }

    for(let collapse of amplitudeSeriesCollapsed){
        seriesValues.push(collapse[0].value);
    }

    logger.logInfo("Returning from ResponseUtil.getSeriesLabels() with value="+JSON.stringify(seriesValues));
    return seriesValues;
}

export function getSeries(amplitudeSegmentData) {
    logger.logInfo("Executing ResponseUtil.getSeries() with Param 1: amplitudeSegmentData="+JSON.stringify(amplitudeSegmentData));
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
   
    logger.logInfo("Executing ResponseUtil.getSeries() with value="+series);
    return series;
  
}

  export function parseFunnelResponse(customer, reportId, responseBody){
    logger.logInfo("Executing ResponseUtil.parseFunnelResponse() with");
    logger.logInfo("Param 1- customer: "+ JSON.stringify(customer));
    logger.logInfo("Param 2- reportId: "+ reportId);
    logger.logInfo("Param 3- responseBody: "+ JSON.stringify(responseBody));

    let finalResponse = null;
    let parsedResponseBody = JSON.parse(responseBody);
    
    logger.logInfo("#####################################################################");
    logger.logInfo("---------------------------------------------------------------------");
    logger.logInfo("---------------------------------------------------------------------");
  
    if (!underscore.has(parsedResponseBody, "data")) {
      logger.logInfo("Data key cnot found in report response.");
      logger.logInfo("Invalid query call. Please check the query.");
      finalResponse = {
        data: new Error("Invalid query call. Please check the query."),
        message: "Error fetching reports",
        status: -1
      }
      logger.logInfo("##############################################################################################")
      logger.logInfo("##############################################################################################")
      logger.logInfo("Response received for channel: "+customer.id+" for the report: "+reportId);
      logger.logInfo("Final Response: " + JSON.stringify(finalResponse));
      logger.logInfo("##############################################################################################")
      logger.logInfo("##############################################################################################")
      return finalResponse;
    }
  
    let responseData = parsedResponseBody.data;
  
    if (typeof responseData != typeof []) {
      logger.logInfo("Invalid report data format.");
      finalResponse = {
        data: new Error("Invalid report data format."),
        message: "Error fetching reports",
        status: -1
      }
      logger.logInfo("##############################################################################################")
      logger.logInfo("##############################################################################################")
      logger.logInfo("Response received for channel: "+customer.id+" for the report: "+reportId);
      logger.logInfo("Final Response: " + JSON.stringify(finalResponse));
      logger.logInfo("##############################################################################################")
      logger.logInfo("##############################################################################################")
      return finalResponse;
    }
  
    if (underscore.isEqual(responseData, [])) {
      logger.logInfo("Data not available for the given customer.");
      finalResponse = {
        data: {},
        message: "No data found.",
        status: 1
      };
    } else {
      logger.logInfo("Data found for the given customer.");
      finalResponse = {
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
  
    logger.logInfo("##############################################################################################");
    logger.logInfo("##############################################################################################");
    logger.logInfo("Response received for channel: "+customer.id+" for the report: "+reportId);
    logger.logInfo("Final Response: " + JSON.stringify(finalResponse));
    logger.logInfo("##############################################################################################");
    logger.logInfo("##############################################################################################");
  
    return finalResponse;
  }

  export function parseSegmentResponse(customer, reportId, responseBody){
    logger.logInfo("Executing ResponseUtil.parseSegmentResponse() with");
    logger.logInfo("Param 1- customer: "+ JSON.stringify(customer));
    logger.logInfo("Param 2- reportId: "+ reportId);
    logger.logInfo("Param 3- responseBody: "+ JSON.stringify(responseBody));

    let finalResponse = null;
    let parsedResponseBody = JSON.parse(responseBody);
    
    logger.logInfo("#####################################################################");
    logger.logInfo("Result of consolidated report: " + JSON.stringify(parsedResponseBody));
    logger.logInfo("---------------------------------------------------------------------");
    logger.logInfo("---------------------------------------------------------------------");
  
    if (!underscore.has(parsedResponseBody, "data")) {
      logger.logInfo("Data key not found in report response.");
      logger.logInfo("Invalid query call. Please check the query.");
      finalResponse = {
        data: new Error("Invalid query call. Please check the query."),
        message: "Error fetching reports",
        status: -1
      }
      logger.logInfo("##############################################################################################")
      logger.logInfo("##############################################################################################")
      logger.logInfo("Response received for channel: "+customer.id+" for the report: "+reportId);
      logger.logInfo("Final Response: " + JSON.stringify(finalResponse));
      logger.logInfo("##############################################################################################")
      logger.logInfo("##############################################################################################")
      return finalResponse;
    }
  
    let responseData = parsedResponseBody.data;
  
    if (typeof responseData != typeof {}) {
      logger.logInfo("Invalid report data format.");
      finalResponse = {
        data: new Error("Invalid report data format."),
        message: "Error fetching reports",
        status: -1
      }
      logger.logInfo("##############################################################################################")
      logger.logInfo("##############################################################################################")
      logger.logInfo("Response received for channel: "+customer.id+" for the report: "+reportId);
      logger.logInfo("Final Response: " + JSON.stringify(finalResponse));
      logger.logInfo("##############################################################################################")
      logger.logInfo("##############################################################################################")
      return finalResponse;
    }
  
    if (underscore.isEqual(responseData, {}) || underscore.isEqual(responseData.seriesCollapsed, [])) {
      logger.logInfo("Data not available for the given customer.");
      finalResponse = {
        data: {},
        message: "No data found.",
        status: 1
      };
    } else {
      logger.logInfo("Data found for the given customer.");
      finalResponse = {
        data: {
          "series":getSeries(responseData)
        },
        message: "Reports fetched successfully.",
        status: 1
      }
    }
  
    logger.logInfo("##############################################################################################");
    logger.logInfo("##############################################################################################");
    logger.logInfo("Response received for channel: "+customer.id+" for the report: "+reportId);
    logger.logInfo("Final Response: " + JSON.stringify(finalResponse));
    logger.logInfo("##############################################################################################");
    logger.logInfo("##############################################################################################");
  
    return finalResponse;
  }

  export function parseSessionResponse(customer, reportId, responseBody){
    logger.logInfo("Executing ResponseUtil.parseSessionResponse() with");
    logger.logInfo("Param 1- customer: "+ JSON.stringify(customer));
    logger.logInfo("Param 2- reportId: "+ reportId);
    logger.logInfo("Param 3- responseBody: "+ JSON.stringify(responseBody));

    let finalResponse = null;
    let parsedResponseBody = JSON.parse(responseBody);
    
    logger.logInfo("#####################################################################");
    logger.logInfo("---------------------------------------------------------------------");
    logger.logInfo("---------------------------------------------------------------------");
  
    if (!underscore.has(parsedResponseBody, "data")) {
      logger.logInfo("Data key not found in report response.");
      logger.logInfo("Invalid query call. Please check the query.");
      finalResponse = {
        data: new Error("Invalid query call. Please check the query."),
        message: "Error fetching reports",
        status: -1
      }
      logger.logInfo("##############################################################################################")
      logger.logInfo("##############################################################################################")
      logger.logInfo("Response received for customer: "+customer.id+" for the report: "+reportId);
      logger.logInfo("Returning from ResponseUtil.parseSessionResponse() with value: " + JSON.stringify(finalResponse));
      logger.logInfo("##############################################################################################");
      logger.logInfo("##############################################################################################");
      return finalResponse;
    }
  
    let responseData = parsedResponseBody.data;
  
    if (typeof responseData != typeof []) {
      logger.logInfo("Invalid report data format.");
      finalResponse = {
        data: new Error("Invalid report data format."),
        message: "Error fetching reports",
        status: -1
      }
      logger.logInfo("##############################################################################################")
      logger.logInfo("##############################################################################################")
      logger.logInfo("Response received for customer: "+customer.id+" for the report: "+reportId);
      logger.logInfo("Returning from ResponseUtil.parseSessionResponse() with value: " + JSON.stringify(finalResponse));
      logger.logInfo("##############################################################################################")
      logger.logInfo("##############################################################################################")
      return finalResponse;
    }
  
    if (underscore.isEqual(responseData, []) || responseData.series[0][0] instanceof Object) {
      logger.logInfo("Data not available for the given customer.");
      finalResponse = {
        data: {},
        message: "No data found.",
        status: 1
      };
    } else {
      logger.logInfo("Data found for the given customer.");
      try{
        finalResponse = {
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
  
    logger.logInfo("##############################################################################################");
    logger.logInfo("##############################################################################################");
    logger.logInfo("Response received for customer: "+customer.id+" for the report: "+reportId);
    logger.logInfo("Returning from ResponseUtil.parseSessionResponse() with value: " + JSON.stringify(finalResponse));
    logger.logInfo("##############################################################################################");
    logger.logInfo("##############################################################################################");
  
    return finalResponse;
  }

  
export function getSessions(sessionData) {
  logger.logInfo("Executing ResponseUtil.getSessions() with Param 1: sessionData="+JSON.stringify(sessionData));
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
 
  logger.logInfo("Executing ResponseUtil.getSessions() with value="+JSON.stringify(series));
  return series;
}

export function getSessionLabels(labels){
  logger.logInfo("Executing ResponseUtil.getSessionLabels() with Param 1: labels="+JSON.stringify(labels));
  let seriesLabels = [];
  if(labels === null){
      throw Error("Session labels are null");
  }

  for(let label of labels){
      seriesLabels.push(label);
  }

  logger.logInfo("Returning from ResponseUtil.getSeriesLabels() with value="+JSON.stringify(seriesLabels));
  return seriesLabels;
}

export function getSessionValues(values){
  logger.logInfo("Executing ResponseUtil.getSessionValues() with Param 1: values="+JSON.stringify(values));
  let sessionValues = [];
  if(values === null){
      throw Error("Session values are null");
  }

  for(let value of values){
      sessionValues.push(value);
  }

  logger.logInfo("Returning from ResponseUtil.getSessionValues() with value="+JSON.stringify(sessionValues));
  return sessionValues;
}

export function isValidResponse(response){
  logger.logInfo("Executing ResponseUtil.isValidResponse()");
  logger.logInfo("Response status: "+response.statusCode);
  
  let isValid = null;

  if (response.statusCode === 200) {
    isValid = true;
  }else{
    isValid = false;
  }

  logger.logInfo("Returning from ResponseUtil.isValidResponse() with value: "+isValid);
  return isValid;
}