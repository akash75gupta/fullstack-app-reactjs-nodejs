import request from 'request';

import * as RequestContext from './RequestContext';
import * as logger from './LoggerUtil';
import * as RestClientUtil from './RestClientUtil';

export default async (req, res, next) => {
  logger.logInfo("In authenticator middleware: " + JSON.stringify(req.body));

  try {
    const { customerId, userInfo } = req.body;
    const { cobrandId, sessionId, appId } = userInfo;

    logger.logInfo("Authenticating user: "+cobrandId);

    let url = process.env.AUTHENTICATION_SERVICE_URL + "/user/userinfo";
    let header = {
      "Authorization":"{userSession=" + sessionId + ",cobrandId=" + cobrandId + ",appId=" + appId + "}"
    }
   
    let response = await RestClientUtil.httpGet(url, header);

    const { memId, email, loginName } = response.userInfo;

    RequestContext.setCobrandId(cobrandId);
    RequestContext.setMemId(memId);
    RequestContext.setEmail(email);
    RequestContext.setUsername(loginName);
      
    if(customerId != undefined || customerId!= null){
      let isValid = await validateCobrandAgainstUser(customerId, userInfo);
      if (!isValid) {
        logger.logError("Unauthorized request! "+userInfo.cobrandId+" not permitted to access information of "+customerId);
        throw new Error("Unauthorized request! "+userInfo.cobrandId+" not permitted to access information of "+customerId);
      }
    }
    logger.logInfo("Authentication success!");
    next();
  } catch (error) {
    logger.logError("Authentication failure!");
    logger.logError(error);
    res.status(401).json({
          "error": "Authentication failure!"
    });
  }
}

export let validateCobrandAgainstUser = (cobrandIdToValidate, userInfo) => {
  logger.logInfo("-------------------------------------------------------------------------------");
  logger.logInfo("Executing Authenticator.validateCobrand() with-");
  logger.logInfo("Param 1:cobrandIdToValidate= " + cobrandIdToValidate);
  logger.logInfo("Param 2:userInfo= " + JSON.stringify(userInfo));
  logger.logInfo("-------------------------------------------------------------------------------");

  return new Promise((resolve, reject) => {
    try {
      const { cobrandId, sessionId, appId } = userInfo;

      if(cobrandId == 10000004){
        logger.logInfo("-------------------------------------------------------------------------------");
        logger.logInfo("Skipping cobrand validation as logged in user is master");
        logger.logInfo("Returning from Authenticator.validateCobrand() with value= " + true);
        logger.logInfo("-------------------------------------------------------------------------------");
        resolve(true);
        return;
      }

      if (cobrandIdToValidate == cobrandId) {
        logger.logInfo("-------------------------------------------------------------------------------");
        logger.logInfo("The user's cobrand and the given cobrand match.");
        logger.logInfo("Returning from Authenticator.validateCobrand() with value= " + true);
        logger.logInfo("-------------------------------------------------------------------------------");
        resolve(true);
        return;
      } else {
        logger.logDebug("-------------------------------------------------------------------------------");
        logger.logDebug("The user's cobrand and the given cobrand do not match.");
        logger.logDebug("Checking if the user's cobrand is a channel of the given cobrand.");
        logger.logDebug("-------------------------------------------------------------------------------");
        let options = {
          method: "GET",
          url: process.env.AUTHENTICATION_SERVICE_URL + "/cobrandInfo/cobrand",
          headers: {
            "Authorization": "{userSession=" + sessionId + ",cobrandId=" + cobrandId + ",appId=" + appId + "}"
          },
          qs: {
            "cobrandId": cobrandId
          }
        };

        request(options, (error, response, body) => {
          try {
            if (error) {
              logger.logError("-------------------------------------------------------------------------------");
              logger.logError(error);
              logger.logError("Returning from Authenticator.validateCobrand() with value= " + error.message);
              logger.logError("-------------------------------------------------------------------------------");
              reject(error);
              return;
            }
            logger.logDebug("-------------------------------------------------------------------------------");
            logger.logDebug("Result of fetching cobrandInfo: " + JSON.stringify(response));
            logger.logDebug("Response body: " + body);
            logger.logDebug("-------------------------------------------------------------------------------");
            
            let parsedBody = JSON.parse(body);
            let cobrandInfo = parsedBody.cobrandInfo;

            if (!cobrandInfo.isChannel) {
              logger.logInfo("-------------------------------------------------------------------------------");
              logger.logInfo("The user's cobrand is not a channel.");
              logger.logInfo("Returning from Authenticator.validateCobrand() with value= " + false);
              logger.logInfo("-------------------------------------------------------------------------------");
              resolve(false);
              return;
            } else {
              logger.logDebug("-------------------------------------------------------------------------------");
              logger.logDebug("The user's cobrand is a channel.");
              logger.logDebug("Checking if the given cobrand for validation is a subbrand of the user's cobrand.");
              logger.logDebug("-------------------------------------------------------------------------------");

              let subbrands = cobrandInfo.subbrands;

              for (let subbrand of subbrands) {
                logger.logDebug("Looping over Sub-brands:" + subbrand.cobrandId);
                if (subbrand.cobrandId == cobrandIdToValidate) {
                  logger.logInfo("-------------------------------------------------------------------------------");
                  logger.logInfo("The given cobrand is a subbrand and conversely the user's cobrand is a channel of the given cobrand");
                  logger.logInfo("Returning from Authenticator.validateCobrand() with value= " + true);
                  logger.logInfo("-------------------------------------------------------------------------------");
                  resolve(true);
                  return;
                }
              }
              logger.logInfo("-------------------------------------------------------------------------------");
              logger.logInfo("The given cobrand is also not a subbrand of the user's cobrand= ");
              logger.logInfo("Returning from Authenticator.validateCobrand() with value= " + false);
              logger.logInfo("-------------------------------------------------------------------------------");
              resolve(false);
              return;
            }
          } catch (error) {
            logger.logError(error);
          }
        });
      }
    } catch (error) {
      logger.logError("-------------------------------------------------------------------------------");
      logger.logError(error);
      logger.logError("Returning from Authenticator.validateCobrand() with value= " + error.message);
      logger.logError("-------------------------------------------------------------------------------");
      reject(error);
      return;
    }
  });
} 