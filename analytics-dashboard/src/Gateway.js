import { Router } from 'express';
import request from 'request';

import * as Config from './Config';
import * as EmailService from './EmailService';
import * as logger from './LoggerUtil';
import * as ReportService from './ReportService';
import * as CustomerService from './CustomerService';

const gateway = Router();

// Request gateway
gateway.post('/extend/session', function (req, res) {
  logger.logInfo("Executing API call /extend/session - Fetching report for a specific customer.");
  res.send("Session Extended");
});

gateway.post('/email', (req, res) => {
  logger.logInfo("Executing API call /email in Gateway");
  res.setTimeout(Config.API_RESPONSE_TIMEOUT, () => {
    logger.logError("Request Timed out!");
    res.status(408).json({
      error: "Request Timed out!"
    });
  });

  try {
    EmailService.sendEmail(req.body);
    res.send(200, "Email Dispatched Successfully");
  } catch (error) {
    logger.logError(error);
  }
});

gateway.post('/cobrandInfo', function (req, res) {
  logger.logInfo("Fetching cobrand info");
  logger.logInfo(req.body);

  res.setTimeout(Config.API_RESPONSE_TIMEOUT, () => {
    logger.logError("Request Timed out!");
    res.status(408).json({
      error: "Request Timed out!"
    });
  });

  try {
    const { cobrandId, sessionId, appId } = req.body.userInfo;

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
      if (error) logger.logError(error);
      logger.logInfo("Result of fetching cobrandInfo: " + JSON.stringify(response));
      logger.logDebug("Response body: " + body);
      res.send(JSON.stringify(JSON.parse(body), null, 2));
    });
  } catch (error) {
    logger.logInfo(error);
    res.send(500, "Internal Server Error!");
  }
});

gateway.post('/report', async (req, res) => {
  logger.logInfo("Executing API call /report - Fetching report for a specific customer.");
  logger.logInfo(req.body);

  res.setTimeout(Config.API_RESPONSE_TIMEOUT, () => {
    logger.logError("Request Timed out!");
    res.status(408).json({
      error: "Request Timed out!"
    });
  });

  let report = null;
  try {
    let { customerId, reportId, reportType } = req.body;

    report = await ReportService.getReportFromCache(customerId, reportId, reportType);

    res.status(200).json(report);

  } catch (error) {
    logger.logError(error);
    res.status(500).json({
      error: "Internal Server Error! " + error.message
    });
  }
});

gateway.post('/amplitude/status', async (req, res) => {
  logger.logInfo("Executing API call /users - Fetching users.");
  logger.logInfo(req.body);

  res.setTimeout(Config.API_RESPONSE_TIMEOUT, () => {
    logger.logError("Request Timed out!");
    res.status(408).json({
      error: "Request Timed out!"
    });
  });

  let amplitudeStatus = null;

  try {
    let { customerId, strictMode } = req.body;

    amplitudeStatus = await CustomerService.getAmplitudeStatus(customerId, strictMode);

    res.status(200).json(amplitudeStatus);

  } catch (error) {
    logger.logError(error);
    res.status(500).json({
      error: "Internal Server Error! " + error.message
    });
  }
});

gateway.post('/register/event', function (req, res) {
  logger.logInfo("Executing API call /register/event - Registering event.");
  logger.logInfo(req.body);

  res.setTimeout(Config.API_RESPONSE_TIMEOUT, () => {
    logger.logError("Request Timed out!");
    res.status(408).json({
      error: "Request Timed out!"
    });
  });

  try {
    let eventId = req.body["eventId"];
    let userInfo = req.body["userInfo"];

    const { cobrandId, sessionId, appId } = userInfo;

    let request = require("request");

    let options = {
      method: "POST",
      url: process.env.AUTHENTICATION_SERVICE_URL + "/coachmark/register/event",
      headers: {
        "Authorization": "{userSession=" + sessionId + ",cobrandId=" + cobrandId + ",appId=" + appId + "}",
        "Content-Type": "application/json"
      },
      json: {
        "eventId": eventId
      }
    };

    request(options, function (error, response, body) {
      try {
        if (error) {
          throw error;
        }
        logger.logInfo("Result of registering event: " + JSON.stringify(response));
        logger.logDebug("Response body: " + JSON.stringify(body));
        res.send(JSON.stringify(body, null, 2));
      } catch (error) {
        logger.logError(error);
        res.send(500, "Internal Server Error!");
      }
    });
  } catch (error) {
    logger.logError(error);
    res.send(500, "Internal Server Error!");
  }
});

gateway.post('/show/feedback', function (req, res) {
  logger.logInfo("Executing API call /show/feedback - Is feedback button enabled?");
  logger.logInfo(req.body);

  res.setTimeout(Config.API_RESPONSE_TIMEOUT, () => {
    logger.logError("Request Timed out!");
    res.status(408).json({
      error: "Request Timed out!"
    });
  });

  try {
    const { cobrandId, sessionId, appId } = req.body.userInfo;

    let request = require("request");

    let options = {
      method: "GET",
      url: process.env.AUTHENTICATION_SERVICE_URL + "/coachmark/show/feedback",
      headers: {
        "Authorization": "{userSession=" + sessionId + ",cobrandId=" + cobrandId + ",appId=" + appId + "}"
      }
    };

    request(options, function (error, response, body) {
      try {
        if (error) {
          throw error;
        }
        logger.logInfo("Result of show feedback: " + JSON.stringify(response));
        logger.logDebug("Response body: " + body);
        res.send(JSON.stringify(JSON.parse(body), null, 2));
      } catch (error) {
        logger.logError(error);
        res.send(500, "Internal Server Error!");
      }
    });
  } catch (error) {
    logger.logError(error);
    res.send(500, "Internal Server Error!");
  }
});

export default gateway;