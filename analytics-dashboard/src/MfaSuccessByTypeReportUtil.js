import underscore from 'underscore';

import * as AmplitudeQueryBuilderUtil from './QueryBuilderUtil';
import * as AmplitudeClient from './AmplitudeClient';
import * as logger from './LoggerUtil';
import * as RedisCacheService from './RedisCacheService';
import * as Constants from './Constants';
import * as RedisUtil from './RedisUtil';
import * as DateUtil from './DateUtil';

export function getMfaSuccessByTypeReport(payload) {
    logger.logInfo("Executing AmplitudeClient.getMfaSuccessByTypeReport() with Param 1- payload: "+JSON.stringify(payload));
    return new Promise((resolve, reject) => {
        let projectId = payload.projectId
        let customerId = payload.customerId;
        let requestType = payload.type;
        let queryString = null;
        let subReports = [
            "MYAPP_MFA_SUCCESS_BY_TYPE_NO_MFA",
            "MYAPP_MFA_SUCCESS_BY_TYPE_SECURITY_QUESTION",
            "MYAPP_MFA_SUCCESS_BY_TYPE_TOKEN",
            "MYAPP_MFA_SUCCESS_BY_TYPE_IMAGE"
        ];  

        RedisCacheService.get(RedisUtil.getKey(customerId, requestType, Constants.MFA_CACHE_REPORT_ID))
            .then((cacheResponse)=>{
                logger.logInfo("Cache retrieved for the report: MFA_SUCCESS_BY_TYPE for the cobrand: "+customerId);
                logger.logInfo("Returning from AmplitudeClient.getMfaSuccessByTypeReport() with value- cacheResponse: " + JSON.stringify(cacheResponse));
                resolve(cacheResponse);
            }).catch((error)=>{
                logger.logInfo("### Promise rejected while retrieving from Cache - Cobrand Id: "+customerId +"- "+error);
                logger.logInfo("Dispatching requests for Combined MFA reports");
                let promises = [];
                for (let i = 0; i < subReports.length; i++) {
                    let subReportId = subReports[i];
                    if (requestType === "ALL") {
                        queryString = AmplitudeQueryBuilderUtil.getFunnelQueryOfMfaSuccessByTypeReportForAllCustomers(customerId, subReportId);
                    } else if (requestType === "SPECIFIC") {
                        queryString = AmplitudeQueryBuilderUtil.getFunnelQueryOfMfaSuccessByTypeReportForSpecificCustomers(customerId, subReportId);
                    } else {
                        logger.logError("Invalid request type: " + requestType);
                    }
                    promises[i] = new Promise((resolve, reject) => {
                        AmplitudeClient.getFunnelReports(customerId, projectId, subReportId, queryString, resolve, reject);
                    });
                }
        
                Promise.all(promises).then((successResponses) => {
                    logger.logDebug("All the promises are resolved. The responses are: "+JSON.stringify(successResponses));
                    let combinedResponse = getCombinedResponseOfAllSubReports(successResponses);
                    logger.logDebug("Returning from AmplitudeClient.getMfaSuccessByTypeReport() with value- "+JSON.stringify(combinedResponse));
                    logger.logInfo("AmplitudeClient.getMfaSuccessByTypeReport() Updating the MFA combined response in redis cache with "+customerId +JSON.stringify(combinedResponse));
                    
                    combinedResponse = DateUtil.updateTimeStamp(combinedResponse);
                    
                    RedisCacheService.save(RedisUtil.getKey(customerId, requestType, Constants.MFA_CACHE_REPORT_ID), JSON.stringify(combinedResponse));
                    resolve(combinedResponse);
                }).catch((errorResponses) => {
                    logger.logError("###Error: All the promises are rejected. The responses are: "+JSON.stringify(errorResponses));
                    logger.logError("Returning from AmplitudeClient.getMfaSuccessByTypeReport() with value- "+JSON.stringify(errorResponses));
                    reject(errorResponses[0]);
                });
            });
    });
  }
  
function getCombinedResponseOfAllSubReports(data) {
    logger.logInfo("Executing AmplitudeClient.getCombinedResponseOfAllSubReports() with-");
    logger.logInfo("Param 1: data= " + JSON.stringify(data));

    let combinedResponse = {
        data: {},
        message: "No data found.",
        status: 1
    };

    logger.logDebug("Combined response initialized: "+JSON.stringify(combinedResponse));
    for(let datum of data){
        if(!underscore.isEqual(datum.data, {})){
            logger.logDebug("Combining response for datum : "+JSON.stringify(datum));
            if(underscore.isEqual(combinedResponse.data.categories,null) || underscore.isEqual(combinedResponse.data.categories,undefined)){
                logger.logDebug("-----------------------------------------");
                logger.logDebug("Initializing combined response categories");
                logger.logDebug("-----------------------------------------");
                combinedResponse.data.categories = [];
            }
            combinedResponse.data.categories.push(getCategory(datum.data.categories));
            let stack = datum.data.stacks[0];
            let dropOffCounts = stack.dropOff.counts;
            for(let i=0; i< dropOffCounts.length; i++){
                if(underscore.isEqual(combinedResponse.data.stacks, null) || underscore.isEqual(combinedResponse.data.stacks, undefined)){
                    logger.logDebug("-----------------------------------------");
                    logger.logDebug("Initializing combined response stacks");
                    logger.logDebug("-----------------------------------------");
                    combinedResponse.data.stacks = [  
                        {
                            "name": "A",
                            "dropOff": {
                                name: "DROPOFF",
                                counts: []
                            },
                            "success": {
                                name: "ALL USERS",
                                counts: []
                            }
                        },
                        {
                            "name": "B",
                            "dropOff": {
                                name: "DROPOFF",
                                counts: []
                            },
                            "success": {
                                name: "ALL USERS",
                                counts: []
                            }
                        }
                    ];
                }
                combinedResponse.data.stacks[i].dropOff.counts.push(dropOffCounts[i]);
            }
            let successCounts = stack.success.counts;
            for(let i=0; i< successCounts.length; i++){
                combinedResponse.data.stacks[i].success.counts.push(successCounts[i]);
            }
        }else{
            logger.logDebug("Skipping datum : "+JSON.stringify(datum));
        }
    }

    logger.logInfo("Returning from AmplitudeClient.getCombinedResponseOfAllSubReports() with value- combinedResponse: " + JSON.stringify(combinedResponse));

    return combinedResponse;
}

function getCategory(categories){
    logger.logInfo("Executing MfaSuccessByTypeReportUtil.getCategory() with Param 1: categories= "+JSON.stringify(categories));
    let category = categories[0].split("(")[1].split(")")[0];
    category = format(category);
    logger.logInfo("Returning from MfaSuccessByTypeReportUtil.getCategory() with value= "+JSON.stringify(category));
    return category;
}

function format(str){
    str = str.toLowerCase().replace(/_/g, ' ');
    str = str.split(' ').map((value)=>{
        return value.replace(/[a-z]/i, (str) => { return str.toUpperCase() });
    });
    str = String(str).replace(/,/g,' ');
    return str;
}