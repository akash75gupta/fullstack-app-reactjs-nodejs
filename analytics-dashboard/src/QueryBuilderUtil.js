import * as DateUtil from './DateUtil';
import * as logger from './LoggerUtil';

export function getFunnelQueryOfMfaSuccessByTypeReportForAllCustomers(customerId, reportId){
    logger.logInfo("Executing QueryBuilderUtil.getFunnelQueryOfMfaSuccessByTypeReportForAllCustomers() with-");
    logger.logInfo("Param 1: customerId="+customerId);
    logger.logInfo("Param 2: reportId="+reportId);

    let queryString = null;
    let queryParams = {
        events:[
        {
            "event_type":"MYAPP_VERIFYCREDS_BUTTON_MFA-NEXT",  
            "filters": [
                {
                "subprop_type": "event",
                "subprop_key": "MFA_TYPE",
                "subprop_op": "is",
                "subprop_value": ["(none)"]
                }
            ]
        },{
            "event_type":"MYAPP_VERIFYCREDS_BACKGROUND_LOGIN-SUCCESS"
        }],
        segments:[
            {
                "prop": "gp:BRAND_ID",
                "op": "is",
                "values": []
            },
            {
                "prop":"gp:MYAPP_TYPE",
                "op":"is",
                "values":["BASIC_AGGREGATION"]
            }
        ]
    };

    if(reportId === "MYAPP_MFA_SUCCESS_BY_TYPE_NO_MFA"){
        queryParams.events[0].filters[0].subprop_value = ["(none)"];
    }else if(reportId === "MYAPP_MFA_SUCCESS_BY_TYPE_SECURITY_QUESTION"){
        queryParams.events[0].filters[0].subprop_value = ["SECURITY_QUESTION"];
    }else if(reportId === "MYAPP_MFA_SUCCESS_BY_TYPE_TOKEN"){
        queryParams.events[0].filters[0].subprop_value = ["TOKEN"];
    }else if(reportId === "MYAPP_MFA_SUCCESS_BY_TYPE_IMAGE"){
        queryParams.events[0].filters[0].subprop_value = ["IMAGE"];
    }else{
        logger.logError("Invalid Report Id for MFA Report By Type");
    }

    queryString = getFunnelQueryAllCustomers(customerId, queryParams);

    logger.logInfo("Returning from QueryBuilderUtil.getFunnelQueryOfMfaSuccessByTypeReportForAllCustomers() with value: "+queryString);

    return queryString;
}

export function getFunnelQueryOfMfaSuccessByTypeReportForSpecificCustomers(customerId, reportId){
    logger.logInfo("Executing QueryBuilderUtil.getFunnelQueryOfMfaSuccessByTypeReportForSpecificCustomers() with-");
    logger.logInfo("Param 1: customerId="+customerId);
    logger.logInfo("Param 2: reportId="+JSON.stringify(reportId));

    let queryString = null;
    let queryParams = {
        events:[
        {
            "event_type":"MYAPP_VERIFYCREDS_BUTTON_MFA-NEXT",  
            "filters": [
                {
                "subprop_type": "event",
                "subprop_key": "MFA_TYPE",
                "subprop_op": "is",
                "subprop_value": ["(none)"]
                }
            ]
        },{
            "event_type":"MYAPP_VERIFYCREDS_BACKGROUND_LOGIN-SUCCESS"
        }],
        segments:[
            {
                "prop": "gp:BRAND_ID",
                "op": "is",
                "values": []
            },
            {
                "prop":"gp:MYAPP_TYPE",
                "op":"is",
                "values":["BASIC_AGGREGATION"]
            }
        ]
    };

    if(reportId === "MYAPP_MFA_SUCCESS_BY_TYPE_NO_MFA"){
        queryParams.events[0].filters[0].subprop_value = ["(none)"];
        logger.logInfo("none");
    }else if(reportId === "MYAPP_MFA_SUCCESS_BY_TYPE_SECURITY_QUESTION"){
        queryParams.events[0].filters[0].subprop_value = ["SECURITY_QUESTION"];
        logger.logInfo("SECURITY_QUESTION");
    }else if(reportId === "MYAPP_MFA_SUCCESS_BY_TYPE_TOKEN"){
        queryParams.events[0].filters[0].subprop_value = ["TOKEN"];
        logger.logInfo("TOKEN");
    }else if(reportId === "MYAPP_MFA_SUCCESS_BY_TYPE_IMAGE"){
        queryParams.events[0].filters[0].subprop_value = ["IMAGE"];
        logger.logInfo("IMAGE");
    }else{
        logger.logError("Invalid Report Id for MFA Report By Type");
    }

    queryString = getFunnelQuerySpecificCustomer(customerId, queryParams);

    logger.logInfo("Returning from QueryBuilderUtil.getFunnelQueryOfMfaSuccessByTypeReportForSpecificCustomers() with value: "+queryString);

    return queryString;
}

export function getFunnelQuerySpecificCustomer(cobrandId, queryParams) {
    logger.logInfo("Executing QueryBuilderUtil.getFunnelQuerySpecificCustomer() with Param 1: cobrandId="+cobrandId
                            +"Param 2: queryParams="+JSON.stringify(queryParams));
    let events = queryParams.events;
    let segments = queryParams.segments;

    let eventQuery=null;
    let segmentQuery=null;

    for(let event of events){
        if(eventQuery==null){
            eventQuery = "";
            eventQuery = "e="+JSON.stringify(event);
        }else{
            eventQuery = eventQuery+"&e="+JSON.stringify(event); 
        }
    }

    segments[0].values.push(cobrandId);

    segmentQuery = "s="+JSON.stringify(segments);

    let startDateQuery = null;
    let endDateQuery   = null;

    let startDate = DateUtil.getDate("YYYYMMDD",-30);
    let endDate   = DateUtil.getDate("YYYYMMDD",0);

    startDateQuery  = "start="+startDate;
    endDateQuery    = "end="+endDate;

    let query = "?"+eventQuery+"&"+segmentQuery+"&"+startDateQuery+"&"+endDateQuery;

    logger.logInfo("Returning from QueryBuilderUtil.getFunnelQuerySpecificCustomer() with value: query="+query);

    return query;
}

export function getSegmentQuerySpecificCustomer(cobrandId, queryParams) {
    logger.logInfo("Executing QueryBuilderUtil.getSegmentQuerySpecificCustomer() with Param 1: cobrandId="+cobrandId
                            +"Param 2: queryParams="+JSON.stringify(queryParams));
    let events = queryParams.events;
    let segments = queryParams.segments;
    let metric = queryParams.metric;
    let interval = queryParams.interval;

    let eventQuery=null;
    let segmentQuery=null;
    let metricQuery=null;
    let intervalQuery=null;

    for(let event of events){
        if(eventQuery==null){
            eventQuery = "";
            eventQuery = "e="+JSON.stringify(event);
        }else{
            eventQuery = eventQuery+"&e="+JSON.stringify(event); 
        }
    }

    segments[0].values.push(cobrandId);

    segmentQuery = "s="+JSON.stringify(segments);

    let startDateQuery = null;
    let endDateQuery   = null;

    let startDate = DateUtil.getDate("YYYYMMDD",-30);
    let endDate   = DateUtil.getDate("YYYYMMDD",0);

    startDateQuery  = "start="+startDate;
    endDateQuery    = "end="+endDate;

    
    metricQuery = "m="+metric;
    intervalQuery = "i="+interval;

    let query = "?"+eventQuery+"&"+segmentQuery+"&"+startDateQuery+"&"+endDateQuery+"&"+metricQuery+"&"+intervalQuery;

    logger.logInfo("Returning from QueryBuilderUtil.getSegmentQuerySpecificCustomer() with value: query="+query);

    return query;
}

export function getFunnelQueryAllCustomers(channelId, queryParams) {
    logger.logInfo("Executing QueryBuilderUtil.getFunnelQueryAllCustomers() with Param 1: cobrandId="+channelId
                            +"Param 2: queryParams="+JSON.stringify(queryParams));
    let events = queryParams.events;
    let segments = queryParams.segments;

    let eventQuery=null;
    let segmentQuery=null;

    for(let event of events){
        if(eventQuery==null){
            eventQuery = "";
            eventQuery = "e="+JSON.stringify(event);
        }else{
            eventQuery = eventQuery+"&e="+JSON.stringify(event); 
        }
    }

    segments[0].prop = "gp:CHANNEL_ID";
    segments[0].values.push(channelId);

    segmentQuery = "s="+JSON.stringify(segments);

    let startDateQuery = null;
    let endDateQuery   = null;

    let startDate = DateUtil.getDate("YYYYMMDD",-30);
    let endDate   = DateUtil.getDate("YYYYMMDD",0);

    startDateQuery  = "start="+startDate;
    endDateQuery    = "end="+endDate;

    let query = "?"+eventQuery+"&"+segmentQuery+"&"+startDateQuery+"&"+endDateQuery;

    logger.logInfo("Returning from QueryBuilderUtil.getFunnelQueryAllCustomers() with value: query="+query);

    return query;
}

export function getSegmentQueryAllCustomers(channelId, queryParams) {
    logger.logInfo("Executing QueryBuilderUtil.getSegmentQueryAllCustomers() with Param 1: cobrandId="+channelId
                            +"Param 2: queryParams="+JSON.stringify(queryParams));
    let events = queryParams.events;
    let segments = queryParams.segments;
    let metric = queryParams.metric;
    let interval = queryParams.interval;

    let eventQuery=null;
    let segmentQuery=null;
    let metricQuery=null;
    let intervalQuery=null;

    for(let event of events){
        if(eventQuery==null){
            eventQuery = "";
            eventQuery = "e="+JSON.stringify(event);
        }else{
            eventQuery = eventQuery+"&e="+JSON.stringify(event); 
        }
    }

    segments[0].prop = "gp:CHANNEL_ID";
    segments[0].values.push(channelId);

    segmentQuery = "s="+JSON.stringify(segments);

    let startDateQuery = null;
    let endDateQuery   = null;

    let startDate = DateUtil.getDate("YYYYMMDD",-30);
    let endDate   = DateUtil.getDate("YYYYMMDD",0);

    startDateQuery  = "start="+startDate;
    endDateQuery    = "end="+endDate;

    metricQuery = "m="+metric;
    intervalQuery = "i="+interval;

    let query = "?"+eventQuery+"&"+segmentQuery+"&"+startDateQuery+"&"+endDateQuery+"&"+metricQuery+"&"+intervalQuery;

    logger.logInfo("Returning from QueryBuilderUtil.getSegmentQueryAllCustomers() with value: query="+query);

    return query;
}

export function getSessionQuerySpecificCustomer(cobrandId, queryParams) {
    logger.logInfo("Executing QueryBuilderUtil.getSessionQuerySpecificCustomer() with Param 1: cobrandId="+cobrandId
                            +"Param 2: queryParams="+JSON.stringify(queryParams));
    let segments = queryParams.segments;
    let segmentQuery=null;

    segments[0].prop = "gp:BRAND_ID";
    segments[0].values.push(cobrandId);

    segmentQuery = "s="+JSON.stringify(segments);

    let startDateQuery = null;
    let endDateQuery   = null;

    let startDate = DateUtil.getDate("YYYYMMDD",-30);
    let endDate   = DateUtil.getDate("YYYYMMDD",0);

    startDateQuery  = "start="+startDate;
    endDateQuery    = "end="+endDate;

    let query = "?"+segmentQuery+"&"+startDateQuery+"&"+endDateQuery;

    logger.logInfo("Returning from QueryBuilderUtil.getSessionQuerySpecificCustomer() with value: query="+query);
    return query;
}

export function getSessionQueryAllCustomers(channelId, queryParams) {
    logger.logInfo("Executing QueryBuilderUtil.getSessionQueryAllCustomers() with Param 1: cobrandId="+channelId
                            +"Param 2: queryParams="+JSON.stringify(queryParams));
    let segments = queryParams.segments;
    let segmentQuery=null;

    segments[0].prop = "gp:CHANNEL_ID";
    segments[0].values.push(channelId);

    segmentQuery = "s="+JSON.stringify(segments);

    let startDateQuery = null;
    let endDateQuery   = null;

    let startDate = DateUtil.getDate("YYYYMMDD",-30);
    let endDate   = DateUtil.getDate("YYYYMMDD",0);

    startDateQuery  = "start="+startDate;
    endDateQuery    = "end="+endDate;

    let query = "?"+segmentQuery+"&"+startDateQuery+"&"+endDateQuery;

    logger.logInfo("Returning from QueryBuilderUtil.getSessionQueryAllCustomers() with value: query="+query);
    return query;
}