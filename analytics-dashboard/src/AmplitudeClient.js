import underscore from 'underscore';
import Bottleneck from "bottleneck";
import request from 'request';

import * as Constants from './Constants';
import * as ResponseUtil from './ResponseUtil';
import * as AmplitudeQueryBuilderUtil from './QueryBuilderUtil';
import * as MfaSuccessByTypeReportUtil from './MfaSuccessByTypeReportUtil';
import * as logger from './LoggerUtil';
import * as RedisCacheService from './RedisCacheService';
import * as RedisUtil from './RedisUtil';
import * as DateUtil from './DateUtil';

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000
});

export function getFunnelReports(customerId, projectId, reportId, queryString, resolve, reject) {
  logger.logInfo("Executing AmplitudeClient.getFunnelSubReports() with-");
  logger.logInfo("Param 1: customerId= " + customerId);
  logger.logInfo("Param 2: projectId= " + projectId);
  logger.logInfo("Param 3: reportId= " + reportId);
  logger.logInfo("Param 4: queryString= " + queryString);

  let amplitudeUrl = process.env.AMPLITUDE_URL;
  let endPoint = Constants.AMPLITUDE_FUNNEL_END_POINT;

  let completeUrl = amplitudeUrl + endPoint + queryString;

  let apiKey = null;
  let secretKey = null;

  if (underscore.isEqual(projectId, Constants.PROJECT_MYAPP)) {
    apiKey = process.env.AMPLITUDE_MYAPP_API_KEY;
    secretKey = process.env.AMPLITUDE_MYAPP_SECRET_KEY;
  } else {
    logger.logError("####Error: Unknown Project Id: " + projectId);
    let finalResponse = {
      data: new Error("Invalid query call. Please check the query."),
      message: "Error fetching reports",
      status: -1
    }
    logger.logError("Returning from AmplitudeClient.getFunnelReports() with value- finalResponse: " + JSON.stringify(finalResponse));
    reject(finalResponse);
    return;
  }

  let options = {
    method: "GET",
    url: completeUrl,
    auth: {
      username: apiKey,
      password: secretKey
    }
  };

  logger.logInfo("Dispatching request for mfa type funnel report: " + JSON.stringify(options));
  limiter.submit(request, options, function (error, response, body) {
    if (error) {
      let finalResponse = {
        data: new Error("Invalid query call. Please check the query."),
        message: "Error fetching reports",
        status: -1
      }
      logger.logError("####Error: " + error);
      logger.logError("Returning from AmplitudeClient.getFunnelReports() with value- finalResponse: " + JSON.stringify(finalResponse));
      reject(finalResponse);
    }
    if(!ResponseUtil.isValidResponse(response)){
      logger.logError(" ### Error . Returning from AmplitudeClient.getFunnelReports() with Amplitude status code "+response.statusCode);
      let finalResponse = {
        data: new Error("Error Response from Amplitude"),
        message: "Error fetching reports",
        status: -1
      }
      reject(finalResponse)
    }
    let finalResponse = ResponseUtil.parseFunnelResponse(customerId, reportId, body);
    logger.logInfo("Returning from AmplitudeClient.getFunnelReports() with value- finalResponse: " + JSON.stringify(finalResponse));
    resolve(finalResponse);
  });

}

export function dispatchRequestForFunnel(payload, sendResponse) {
  logger.logInfo("Executing AmplitudeClient.dispatchRequestForFunnel() with Param- payload: " + JSON.stringify(payload));

  let projectId = payload.projectId
  let reportId = payload.reportId;
  let customerId = payload.customerId;
  let queryParams = payload.queryParams;
  let requestType = payload.type;

  let queryString = null;

  //HACK - To be removed
  if (reportId === "MYAPP_MFA_SUCCESS_BY_TYPE") {
    MfaSuccessByTypeReportUtil.getMfaSuccessByTypeReport(payload).then((finalResponse) => {
      logger.logInfo("Returning from AmplitudeClient.dispatchRequestForFunnel() for MFA success by type report with value- finalResponse: " + JSON.stringify(finalResponse));
      sendResponse.send(JSON.stringify(finalResponse, null, 2));
    }).catch((errorResponse) => {
      logger.logError("####Error: Getting MFASuccessByTypeReport. " + errorResponse);
      let finalResponse = {
        data: new Error("Invalid query call. Please check the query."),
        message: "Error fetching reports",
        status: -1
      }
      logger.logInfo("Returning from AmplitudeClient.dispatchRequestForFunnel() with value- finalResponse: " + JSON.stringify(finalResponse));
      sendResponse.send(JSON.stringify(finalResponse, null, 2));
      return;
    })
  } else {
    if (requestType === "ALL") {
      queryString = AmplitudeQueryBuilderUtil.getFunnelQueryAllCustomers(customerId, queryParams);
    } else if (requestType === "SPECIFIC") {
      queryString = AmplitudeQueryBuilderUtil.getFunnelQuerySpecificCustomer(customerId, queryParams);
    } else {
      logger.logError("Invalid request type: " + requestType);
    }

    let amplitudeUrl = process.env.AMPLITUDE_URL;
    let endPoint = Constants.AMPLITUDE_FUNNEL_END_POINT;

    let completeUrl = amplitudeUrl + endPoint + queryString;

    let apiKey = null;
    let secretKey = null;

    if (underscore.isEqual(projectId, Constants.PROJECT_MYAPP)) {
      apiKey = process.env.AMPLITUDE_MYAPP_API_KEY;
      secretKey = process.env.AMPLITUDE_MYAPP_SECRET_KEY;
    } else {
      logger.logError("Unknown Project Id: " + projectId);
      let finalResponse = {
        data: new Error("Invalid query call. Please check the query."),
        message: "Error fetching reports",
        status: -1
      }
      sendResponse.send(JSON.stringify(finalResponse, null, 2));
      logger.logInfo("Returning from AmplitudeClient.dispatchRequestForFunnel() with value- finalResponse: " + JSON.stringify(finalResponse));
      return;
    }

    let options = {
      method: "GET",
      url: completeUrl,
      auth: {
        username: apiKey,
        password: secretKey
      }
    };

    RedisCacheService.get(RedisUtil.getKey(customerId, requestType, reportId))
      .then((cacheResponse) => {
        logger.logInfo("Reports retrieved from cache for the report: " + reportId + " of the cobrand: " + customerId);
        logger.logInfo("Returning from AmplitudeClient.dispatchRequestForFunnel() with value- cacheResponse: " + JSON.stringify(cacheResponse));
        sendResponse.send(JSON.stringify(cacheResponse, null, 2));
      }).catch((error) => {
        logger.logInfo("##Promise rejected while retrieving data from Redis for report: " + reportId + " of the cobrand : " + customerId);
        logger.logInfo(error);
        logger.logInfo("Dispatching request for funnel: " + JSON.stringify(options));
        limiter.submit(request, options, function (error, response, body) {
          if (error) {
            let finalResponse = {
              data: new Error("Invalid query call. Please check the query."),
              message: "Error fetching reports",
              status: -1
            }
            logger.logError("####Error: " + error);
            logger.logError("Returning from AmplitudeClient.dispatchRequestForFunnel() with value- finalResponse: " + JSON.stringify(finalResponse));
            sendResponse.send(JSON.stringify(finalResponse, null, 2));
            return;
          }
          if(!ResponseUtil.isValidResponse(response)){
            let finalResponse = {
              data: new Error("Error Response from Amplitude"),
              message: "Error fetching reports",
              status: -1
            }
            logger.logError("####Error: " + error);
            logger.logError("Returning from AmplitudeClient.dispatchRequestForFunnel() with value Amplitude status code "+response.statusCode);
            sendResponse.send(JSON.stringify(finalResponse, null, 2));
            return;
          }
          let finalResponse = ResponseUtil.parseFunnelResponse(customerId, reportId, body);
          logger.logInfo("AmplitudeClient.dispatchRequestForFunnel() Updating the response in redis cache with " + customerId + ' ' + reportId + ' ' + JSON.stringify(finalResponse));
          
          finalResponse = DateUtil.updateTimeStamp(finalResponse);

          RedisCacheService.save(RedisUtil.getKey(customerId, requestType, reportId), JSON.stringify(finalResponse));
          logger.logInfo("Returning from AmplitudeClient.dispatchRequestForFunnel() with value- finalResponse: " + JSON.stringify(finalResponse));
          sendResponse.send(JSON.stringify(finalResponse, null, 2));
        });
      });
  }
}

export function dispatchRequestForSegment(payload, sendResponse) {
  logger.logInfo("Executing AmplitudeClient.dispatchRequestForSegment() with Param- payload: " + JSON.stringify(payload));

  let projectId = payload.projectId
  let reportId = payload.reportId;
  let customerId = payload.customerId;
  let queryParams = payload.queryParams;
  let requestType = payload.type;

  let queryString = null;

  if (requestType === "ALL") {
    queryString = AmplitudeQueryBuilderUtil.getSegmentQueryAllCustomers(customerId, queryParams);
  } else if (requestType === "SPECIFIC") {
    queryString = AmplitudeQueryBuilderUtil.getSegmentQuerySpecificCustomer(customerId, queryParams);
  } else {
    logger.logError("Invalid request type: " + requestType);
    let finalResponse = {
      data: new Error("Invalid request type: " + requestType),
      message: "Error fetching reports",
      status: -1
    }
    logger.logInfo("Returning from AmplitudeClient.dispatchRequestForSegment() with value- finalResponse: " + JSON.stringify(finalResponse));
    sendResponse.send(JSON.stringify(finalResponse, null, 2));
    return;
  }

  let amplitudeUrl = process.env.AMPLITUDE_URL;
  let endPoint = Constants.AMPLITUDE_SEGMENT_END_POINT;

  let completeUrl = amplitudeUrl + endPoint + queryString;

  let apiKey = null;
  let secretKey = null;

  if (underscore.isEqual(projectId, Constants.PROJECT_MYAPP)) {
    apiKey = process.env.AMPLITUDE_MYAPP_API_KEY;
    secretKey = process.env.AMPLITUDE_MYAPP_SECRET_KEY;
  } else {
    logger.logError("Unknown Project Id: " + projectId);
    let finalResponse = {
      data: new Error("Unknown Project Id: " + projectId),
      message: "Error fetching reports",
      status: -1
    }
    logger.logInfo("Returning from AmplitudeClient.dispatchRequestForSegment() with value- finalResponse: " + JSON.stringify(finalResponse));
    sendResponse.send(JSON.stringify(finalResponse, null, 2));
    return;
  }

  let options = {
    method: "GET",
    url: completeUrl,
    auth: {
      username: apiKey,
      password: secretKey
    }
  };

  RedisCacheService.get(RedisUtil.getKey(customerId, requestType, reportId))
    .then((cacheResponse) => {
      logger.logInfo("Report retrieved from cache for the report: " + reportId + " of the cobrand: " + customerId);
      logger.logInfo("Returning from AmplitudeClient.dispatchRequestForSegment() with value: " + JSON.stringify(cacheResponse) + " from Redis Cache");
      sendResponse.send(JSON.stringify(cacheResponse, null, 2));
    }).catch((error) => {
      logger.logInfo("## Redis promise rejected : " + reportId + " CobrandId : " + customerId + " " + error);
      logger.logInfo("Dispatching request for segment: " + JSON.stringify(options));
      limiter.submit(request, options, function (error, response, body) {
        let finalResponse = null;
        if (error) {
          finalResponse = {
            data: new Error("Invalid query call. Please check the query."),
            message: "Error fetching reports",
            status: -1
          }
          logger.logError("####Error: " + error);
          logger.logError("Returning from AmplitudeClient.dispatchRequestForSegment() with value- finalResponse: " + JSON.stringify(finalResponse));
          sendResponse.send(JSON.stringify(finalResponse, null, 2));
          return;
        }
        if(!ResponseUtil.isValidResponse(response)){
          let finalResponse = {
            data: new Error("Error Response from Amplitude"),
            message: "Error fetching reports",
            status: -1
          }
          logger.logError("####Error: " + error);
          logger.logError("Returning from AmplitudeClient.dispatchRequestForSegment() with value Amplitude status code "+response.statusCode);
          sendResponse.send(JSON.stringify(finalResponse, null, 2));
          return;
        }
        finalResponse = ResponseUtil.parseSegmentResponse(customerId, reportId, body);
        logger.logInfo("AmplitudeClient.dispatchRequestForSegment() Updating the response in redis cache with " + customerId + ' ' + reportId + ' ' + JSON.stringify(finalResponse));
        
        finalResponse = DateUtil.updateTimeStamp(finalResponse);

        RedisCacheService.save(RedisUtil.getKey(customerId, requestType, reportId), JSON.stringify(finalResponse));
        logger.logInfo("Returning from AmplitudeClient.dispatchRequestForSegment() with value- finalResponse: " + JSON.stringify(finalResponse));
        sendResponse.send(JSON.stringify(finalResponse, null, 2));
      });
    });
}

export function dispatchRequestForSession(payload, sendResponse) {
  logger.logInfo("Executing AmplitudeClient.dispatchRequestForSession() with Param- payload: " + JSON.stringify(payload));

  let projectId = payload.projectId
  let reportId = payload.reportId;
  let customerId = payload.customerId;
  let queryParams = payload.queryParams;
  let requestType = payload.type;

  let queryString = null;

  if (requestType === "ALL") {
    queryString = AmplitudeQueryBuilderUtil.getSessionQueryAllCustomers(customerId, queryParams);
  } else if (requestType === "SPECIFIC") {
    queryString = AmplitudeQueryBuilderUtil.getSessionQuerySpecificCustomer(customerId, queryParams);
  } else {
    logger.logError("Invalid request type: " + requestType);
    let finalResponse = {
      data: new Error("Invalid request type: " + requestType),
      message: "Error fetching reports",
      status: -1
    }
    logger.logInfo("Returning from AmplitudeClient.dispatchRequestForSession() with value- finalResponse: " + JSON.stringify(finalResponse));
    sendResponse.send(JSON.stringify(finalResponse, null, 2));
    return;
  }

  let amplitudeUrl = process.env.AMPLITUDE_URL;
  let endPoint = Constants.AMPLITUDE_SESSION_END_POINT;

  let completeUrl = amplitudeUrl + endPoint + queryString;

  let apiKey = null;
  let secretKey = null;

  if (underscore.isEqual(projectId, Constants.PROJECT_MYAPP)) {
    apiKey = process.env.AMPLITUDE_MYAPP_API_KEY;
    secretKey = process.env.AMPLITUDE_MYAPP_SECRET_KEY;
  } else {
    logger.logError("Unknown Project Id: " + projectId);
    let finalResponse = {
      data: new Error("Unknown Project Id: " + projectId),
      message: "Error fetching reports",
      status: -1
    }
    logger.logInfo("Returning from AmplitudeClient.dispatchRequestForSession() with value- finalResponse: " + JSON.stringify(finalResponse));
    sendResponse.send(JSON.stringify(finalResponse, null, 2));
    return;
  }

  let options = {
    method: "GET",
    url: completeUrl,
    auth: {
      username: apiKey,
      password: secretKey
    }
  };

  RedisCacheService.get(RedisUtil.getKey(customerId, requestType, reportId))
    .then((cacheResponse) => {
      logger.logInfo("Report retrieved from cache: " + reportId + " Cobrand Id " + customerId + "Value " + JSON.stringify(cacheResponse));
      logger.logInfo("Returning from AmplitudeClient.dispatchRequestForSession() with value- cacheResponse: " + JSON.stringify(cacheResponse) + " from Redis Cahce");
      sendResponse.send(JSON.stringify(cacheResponse, null, 2));
    }).catch((error) => {
      logger.logInfo("### Redis promise rejected while retriving from cache: " + reportId + " CobrandId : " + customerId + " " + error);
      logger.logInfo("Dispatching request for session: " + JSON.stringify(options));
        limiter.submit(request, options, function (error, response, body) {
          let finalResponse = null;
          if (error) {
            finalResponse = {
              data: new Error("Invalid query call. Please check the query."),
              message: "Error fetching reports",
              status: -1
            }
            logger.logError("####Error: " + error);
            logger.logError("Returning from AmplitudeClient.dispatchRequestForSession() with value- finalResponse: " + JSON.stringify(finalResponse));
            sendResponse.send(JSON.stringify(finalResponse, null, 2));
            return;
          }
          if(!ResponseUtil.isValidResponse(response)){
            let finalResponse = {
              data: new Error("Error Response from Amplitude"),
              message: "Error fetching reports",
              status: -1
            }
            logger.logError("####Error: " + error);
            logger.logError("Returning from AmplitudeClient.dispatchRequestForSession() with value Amplitude status code "+response.statusCode);
            sendResponse.send(JSON.stringify(finalResponse, null, 2));
            return;
          }
          finalResponse = ResponseUtil.parseSessionResponse(customerId, reportId, body);
          logger.logInfo("AmplitudeClient.dispatchRequestForSession() Updating the response in redis cache with " + customerId + ' ' + JSON.stringify(finalResponse));
          
          finalResponse = DateUtil.updateTimeStamp(finalResponse);

          RedisCacheService.save(RedisUtil.getKey(customerId, requestType, reportId), JSON.stringify(finalResponse));          
          logger.logInfo("Returning from AmplitudeClient.dispatchRequestForSession() with value- finalResponse: " + JSON.stringify(finalResponse));
          sendResponse.send(JSON.stringify(finalResponse, null, 2));
        });
    });
}

export function dispatchRequestForUserSearch(payload, sendResponse) {
  logger.logInfo("Executing AmplitudeClient.dispatchRequestForUserSearch() with Param- payload: " + JSON.stringify(payload));

  let customerId = payload.customerId;
  let searchMode = payload.searchMode;

  let apiKey = null;
  let secretKey = null;

  apiKey = process.env.AMPLITUDE_MYAPP_API_KEY;
  secretKey = process.env.AMPLITUDE_MYAPP_SECRET_KEY;

  let options = {
    method: "GET",
    url: process.env.AMPLITUDE_URL + '/usersearch',
    auth: {
      username: apiKey,
      password: secretKey
    },
    qs:
    {
      "user": "gp:BRAND_ID=" + customerId + " gp:MYAPP_TYPE=BASIC_AGGREGATION"
    }
  };

  RedisCacheService.get(RedisUtil.getKey(customerId, Constants.USER_AVAILABILITY_CACHE_ID))
    .then((cacheResponse) => {
      logger.logInfo("User search result retrieved from cache for cobrand: " + customerId);
      logger.logInfo("Returning from API call /users with value from Cache : " + JSON.stringify(cacheResponse));
      sendResponse.send(JSON.stringify(cacheResponse, null, 2));
    }).catch((error) => {
      logger.logInfo("Exception occurred while  retrieving user search  from Cache in AmplitudeClient.dispatchRequestForUserSearch() CobrandId : " + customerId + " " + error);
      logger.logInfo("Connecting with options : "+JSON.stringify(options));
      limiter.submit(request, options, function (error, response, body) {
        let usersAvailable = false;
        if (error) {
          logger.logError(error);
        }
        if(!ResponseUtil.isValidResponse(response)){
          let finalResponse = {
            data: new Error("Error Response from Amplitude"),
            message: "Error fetching reports",
            status: -1
          }
          logger.logError("####Error: " + error);
          logger.logError("Returning from AmplitudeClient.dispatchRequestForUserSearch() with value Amplitude status code "+response.statusCode);
          sendResponse.send(JSON.stringify(finalResponse, null, 2));
          return;
        }
        let parsedBody = JSON.parse(body);
        logger.logInfo("Result of fetching users: " + JSON.stringify(response));
        logger.logInfo("Response body: " + JSON.stringify(parsedBody));

        if (parsedBody.type === "nomatch") {
          logger.logDebug("Users not found for the given customer.");
          usersAvailable = false;
        } else {
          usersAvailable = true;
          logger.logDebug("Users found for the given customer.");
          let finalResponse = {
            enableAmplitude: usersAvailable
          };
          logger.logInfo("AmplitudeClient.dispatchRequestForUserSearch() Updating the response in redis cache with " + customerId + ' ' + JSON.stringify(finalResponse));          
          RedisCacheService.save(RedisUtil.getKey(customerId, Constants.USER_AVAILABILITY_CACHE_ID), JSON.stringify(finalResponse));
          logger.logInfo("Returning from API call /users with value: " + JSON.stringify(finalResponse));
          sendResponse.send(JSON.stringify(finalResponse, null, 2));
          return;
        }

        if (searchMode != null && searchMode != undefined && searchMode == "STRICT") {
          logger.logDebug("Skipping sub-brand user search since mode of search is STRICT");
          let finalResponse = {
            enableAmplitude: usersAvailable
          };
          logger.logInfo("AmplitudeClient.dispatchRequestForUserSearch() Updating the response in redis cache with " + customerId + ' ' + JSON.stringify(finalResponse));
          RedisCacheService.save(RedisUtil.getKey(customerId, Constants.USER_AVAILABILITY_CACHE_ID), JSON.stringify(finalResponse));
          logger.logInfo("Returning from API call /users with value: " + JSON.stringify(finalResponse));
          sendResponse.send(JSON.stringify(finalResponse, null, 2));
          return;
        }

        let options = {
          method: "GET",
          url: process.env.AMPLITUDE_URL + '/usersearch',
          auth: {
            username: apiKey,
            password: secretKey
          },
          qs:
          {
            "user": "gp:CHANNEL_ID=" + customerId + " gp:MYAPP_TYPE=BASIC_AGGREGATION"
          }
        };

        logger.logDebug("Didn't find any users for the given customer; hence, checking for users of its subbrand");
        limiter.submit(request, options, function (error, response, body) {
          let subrandUsersAvailable = false;

          if (error) {
            logger.logError(error);
          }
          if(!ResponseUtil.isValidResponse(response)){
            let finalResponse = {
              data: new Error("Error Response from Amplitude"),
              message: "Error fetching reports",
              status: -1
            }
            logger.logError("####Error: " + error);
            logger.logError("Returning from AmplitudeClient.dispatchRequestForUserSearch() with value Amplitude status code "+response.statusCode);
            sendResponse.send(JSON.stringify(finalResponse, null, 2));
            return;
          }
          let parsedBody = JSON.parse(body);
          logger.logInfo("Result of fetching users: " + JSON.stringify(response));
          logger.logInfo("Response body: " + JSON.stringify(parsedBody));

          if (parsedBody.type === "nomatch") {
            logger.logDebug("Users not found for subbrands.");
            subrandUsersAvailable = false;
          } else {
            logger.logInfo("Users found for subbrands.");
            subrandUsersAvailable = true;
          }

          let finalResponse = {
            enableAmplitude: usersAvailable || subrandUsersAvailable
          };
          logger.logInfo("AmplitudeClient.dispatchRequestForUserSearch() Updating the response in redis cache with " + customerId + ' ' + JSON.stringify(finalResponse));
          RedisCacheService.save(RedisUtil.getKey(customerId, Constants.USER_AVAILABILITY_CACHE_ID), JSON.stringify(finalResponse));
          logger.logInfo("Returning from API call /users with value: " + JSON.stringify(finalResponse));
          sendResponse.send(JSON.stringify(finalResponse, null, 2));
        });
      });
    });
}