import request from 'request';

import * as logger from './LoggerUtil';
import * as ResponseUtil from './ResponseUtil'

export let httpGet = (url, header, auth) => {
    return new Promise((resolve, reject) => {
        logger.logInfo("RestClientUtil.httpGet()");
        logger.logInfo("Param 1 - url: " + url);
        logger.logInfo("Param 2 - header: " + JSON.stringify(header));
        logger.logInfo("Param 3 - auth: " + JSON.stringify(auth));

        let options = {
            method: "GET",
            url: url,
            auth: auth,
            headers: header
        };

        request(options, function (error, response, body) {
            if (error) {
                logger.logError("Error fetching reports! Invalid query call. Please check the query.");
                logger.logError(error);
                reject(new Error("Invalid query call. Please check the query."));
                return;
            }

            if (!ResponseUtil.isValidResponse(response)) {
                logger.logError("Error fetching reports! Invalid response from Amplitude");
                reject(new Error("Invalid response from Amplitude"));
                return;
            }
            logger.logInfo("Returning from RestClient.httpGet() with value: " + JSON.stringify(JSON.parse(body)));
            resolve(JSON.parse(body));
        });
    });
}

export let httpPost = (url, body, header, auth) => {
    return new Promise((resolve, reject) => {
        logger.logInfo("RestClientUtil.httpPost()");
        logger.logInfo("Param 1 - url: " + url);
        logger.logInfo("Param 2 - method: " + JSON.stringify(body));
        logger.logInfo("Param 3 - header: " + JSON.stringify(header));
        logger.logInfo("Param 4 - auth: " + JSON.stringify(auth));

        let options = {
            method: "POST",
            url: url,
            auth: auth,
            headers: header,
            json: body
        };

        request(options, function (error, response, body) {
            if (error) {
                logger.logError("Error fetching reports! Invalid query call. Please check the query.");
                logger.logError(error);
                reject(new Error("Invalid query call. Please check the query."));
                return;
            }
            if (!ResponseUtil.isValidResponse(response)) {
                logger.logError("Error fetching reports! Invalid response from Amplitude");
                reject(new Error("Invalid response from Amplitude"));
                return;
            }
            logger.logInfo("Returning from RestClient.httpPost() with value: " + JSON.stringify(body));
            resolve(body);
        });
    });
}