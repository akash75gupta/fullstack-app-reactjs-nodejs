import * as RestClientUtil from './RestClientUtil';
import * as logger from './LoggerUtil';
import * as ReportUtil from './ReportUtil';
import * as Constants from './Constants';
import * as AmplitudeQueryBuilderUtil from './QueryBuilderUtil';
import * as DateUtil from './DateUtil';
import * as Config from './Config';
import * as RedisService from './RedisCacheService';
import * as RedisUtil from './RedisUtil';


import underscore from 'underscore';

export let getReports = async (customer) => {
    logger.logInfo("Executing ReportService.getReports() with param 1- customer: " + customer);
    let reports = {};
    try {
        let reportsToFetch = Config.REPORTS;

        for (let reportToFetch of reportsToFetch) {
            let reportSpecification = ReportUtil.getReportSpecification(reportToFetch);
            let reportType = reportSpecification.type;
            let queryParams = reportSpecification.query.urlParams;

            let report = null;

            let request = {
                reportId: reportToFetch,
                customerId: customer,
                type: "SPECIFIC",
                queryParams: queryParams
            };

            if (reportType === Constants.AMPLITUDE_REPORT_TYPE_FUNNEL) {
                try {
                    report = await fetchFunnelReport(request);
                    report.lastRefreshTimestamp = DateUtil.getDate(Constants.DATE_FORMAT_ISO,0);
                } catch (error) {
                    report = {
                        data: error,
                        message: "Error fetching funnel report!",
                        status: -1
                    }
                }
                reports[reportToFetch] = report;
            } else if (reportType === Constants.AMPLITUDE_REPORT_TYPE_SEGMENT) {
                try {
                    report = await fetchSegmentReport(request);
                    report.lastRefreshTimestamp = DateUtil.getDate(Constants.DATE_FORMAT_ISO,0);
                } catch (error) {
                    report = {
                        data: error,
                        message: "Error fetching segment report!",
                        status: -1
                    }
                }
                reports[reportToFetch] = report;
            } else if (reportType === Constants.AMPLITUDE_REPORT_TYPE_SESSION) {
                try {
                    report = await fetchSessionReport(request);
                    report.lastRefreshTimestamp = DateUtil.getDate(Constants.DATE_FORMAT_ISO,0);
                } catch (error) {
                    report = {
                        data: error,
                        message: "Error fetching session report!",
                        status: -1
                    }
                }
                reports[reportToFetch] = report;
            } else {
                logger.logError("Unknown report type!");
                report = {
                    data: new Error("Unknown report type!"),
                    message: "Unknown report type!",
                    status: -1
                }
                reports[reportToFetch] = report;
            }
        }

    } catch (error) {
        logger.logError(error);
        throw new Error("Error fetching reports for customer: " + customer + "!");
    }

    logger.logInfo("Returning from ReportService.getReports() with value: " + JSON.stringify(reports));
    return reports;
}

let getFunnelSubReports = async (customerId, projectId, reportId, queryString) => {
    logger.logInfo("Executing ReportService.getFunnelSubReports() with-");
    logger.logInfo("Param 1: customerId= " + customerId);
    logger.logInfo("Param 2: projectId= " + projectId);
    logger.logInfo("Param 3: reportId= " + reportId);
    logger.logInfo("Param 4: queryString= " + queryString);

    let fetchedReport = null;

    let amplitudeUrl = process.env.AMPLITUDE_URL;
    let endPoint = Config.AMPLITUDE_FUNNEL_END_POINT;

    let completeUrl = amplitudeUrl + endPoint + queryString;

    let apiKey = process.env.AMPLITUDE_MYAPP_API_KEY;
    let secretKey = process.env.AMPLITUDE_MYAPP_SECRET_KEY;

    let url = completeUrl;
    let auth = {
        username: apiKey,
        password: secretKey
    };

    let response = null;
    try {
        response = await RestClientUtil.httpGet(url, null, auth);
    } catch (error) {
        logger.logError("Error dispatching request!");
        logger.logError(error);
        throw new Error("Error dispatching request!")
    }

    try {
        fetchedReport = ReportUtil.parseFunnelReport(customerId, reportId, response);
    } catch (error) {
        logger.logError("Error parsing funnel sub report!");
        logger.logError(error);
        throw new Error("Error parsing funnel sub report!")
    }

    logger.logInfo("Returning from ReportService.getFunnelSubReports() with value: " + JSON.stringify(fetchedReport));
    return fetchedReport;

}

let fetchFunnelReport = async (payload) => {
    logger.logInfo("Executing ReportService.dispatchRequestForFunnel() with Param- payload: " + JSON.stringify(payload));

    let fetchedReport = null;

    let reportId = payload.reportId;
    let customerId = payload.customerId;
    let queryParams = payload.queryParams;
    let requestType = payload.type;

    let queryString = null;

    //HACK - To be removed
    if (reportId === "MYAPP_MFA_SUCCESS_BY_TYPE") {
        try {
            fetchedReport = await getMfaSuccessByTypeReport(payload);
        } catch (error) {
            logger.logError("Error fetching MFASuccessByTypeReport!");
            logger.logError(error);
        }
    } else {
        if (requestType === "ALL") {
            queryString = AmplitudeQueryBuilderUtil.getFunnelQueryAllCustomers(customerId, queryParams);
        } else if (requestType === "SPECIFIC") {
            queryString = AmplitudeQueryBuilderUtil.getFunnelQuerySpecificCustomer(customerId, queryParams);
        } else {
            throw new Error("Invalid request type: " + requestType);
        }

        let amplitudeUrl = process.env.AMPLITUDE_URL;
        let endPoint = Config.AMPLITUDE_FUNNEL_END_POINT;

        let completeUrl = amplitudeUrl + endPoint + queryString;

        let apiKey = process.env.AMPLITUDE_MYAPP_API_KEY;
        let secretKey = process.env.AMPLITUDE_MYAPP_SECRET_KEY;

        let url = completeUrl;
        let auth = {
            username: apiKey,
            password: secretKey
        };

        let response = null;
        try {
            response = await RestClientUtil.httpGet(url, null, auth);
        } catch (error) {
            logger.logError("Error dispatching request!");
            logger.logError(error);
            throw new Error("Error dispatching request!")
        }

        try {
            fetchedReport = ReportUtil.parseFunnelReport(customerId, reportId, response);
        } catch (error) {
            logger.logError("Error parsing funnel report!");
            logger.logError(error);
            throw new Error("Error parsing funnel report!")
        }
    }

    logger.logInfo("Returning from ReportService.fetchSessionReport() with value: " + JSON.stringify(fetchedReport));
    return fetchedReport;
}

let fetchSegmentReport = async (payload) => {
    logger.logInfo("Executing ReportService.dispatchRequestForSegment() with Param- payload: " + JSON.stringify(payload));

    let fetchedReport = null;

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
        throw new Error("Invalid request type: " + requestType);
    }

    let amplitudeUrl = process.env.AMPLITUDE_URL;
    let endPoint = Config.AMPLITUDE_SEGMENT_END_POINT;

    let completeUrl = amplitudeUrl + endPoint + queryString;

    let apiKey = process.env.AMPLITUDE_MYAPP_API_KEY;
    let secretKey = process.env.AMPLITUDE_MYAPP_SECRET_KEY;

    let url = completeUrl;
    let auth = {
        username: apiKey,
        password: secretKey
    };

    let response = null;
    try {
        response = await RestClientUtil.httpGet(url, null, auth);
    } catch (error) {
        logger.logError("Error dispatching request!");
        logger.logError(error);
        throw new Error("Error dispatching request!")
    }

    try {
        fetchedReport = ReportUtil.parseSegmentReport(customerId, reportId, response);
    } catch (error) {
        logger.logError("Error parsing segment report!");
        logger.logError(error);
        throw new Error("Error parsing segment report!")
    }

    logger.logInfo("Returning from ReportService.fetchSessionReport() with value: " + JSON.stringify(fetchedReport));
    return fetchedReport;

}

let fetchSessionReport = async (payload) => {
    logger.logInfo("Executing ReportService.dispatchRequestForSession() with Param- payload: " + JSON.stringify(payload));
    let fetchedReport = null;

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
        throw new Error("Invalid request type: " + requestType);
    }

    let amplitudeUrl = process.env.AMPLITUDE_URL;
    let endPoint = Config.AMPLITUDE_SESSION_END_POINT;

    let completeUrl = amplitudeUrl + endPoint + queryString;

    let apiKey = process.env.AMPLITUDE_MYAPP_API_KEY;
    let secretKey = process.env.AMPLITUDE_MYAPP_SECRET_KEY;

    let url = completeUrl;
    let auth = {
        username: apiKey,
        password: secretKey
    };

    let response = null;
    try {
        response = await RestClientUtil.httpGet(url, null, auth);
    } catch (error) {
        logger.logError("Error dispatching request!");
        logger.logError(error);
        throw new Error("Error dispatching request!")
    }

    try {
        fetchedReport = ReportUtil.parseSessionReport(customerId, reportId, response);
    } catch (error) {
        logger.logError("Error parsing session report!");
        logger.logError(error);
        throw new Error("Error parsing session report!")
    }

    logger.logInfo("Returning from ReportService.fetchSessionReport() with value: " + JSON.stringify(fetchedReport));
    return fetchedReport;
}

let getMfaSuccessByTypeReport = async (payload) => {
    logger.logInfo("Executing ReportService.getMfaSuccessByTypeReport() with Param 1- payload: " + JSON.stringify(payload));

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

    let fetchedSubReports = null;

    for (let i = 0; i < subReports.length; i++) {
        let subReportId = subReports[i];
        if (requestType === "ALL") {
            queryString = AmplitudeQueryBuilderUtil.getFunnelQueryOfMfaSuccessByTypeReportForAllCustomers(customerId, subReportId);
        } else if (requestType === "SPECIFIC") {
            queryString = AmplitudeQueryBuilderUtil.getFunnelQueryOfMfaSuccessByTypeReportForSpecificCustomers(customerId, subReportId);
        } else {
            throw new Error("Invalid request type: " + requestType);
        }

        let subReport = null;

        try {
            subReport = await getFunnelSubReports(customerId, projectId, subReportId, queryString);
            if (fetchedSubReports == null) {
                fetchedSubReports = [];
            }
            fetchedSubReports.push(subReport);
        } catch (error) {
            logger.logError(error);
            throw new Error("Error getting funnel sub report! " + subReportId);
        }
    }

    let combinedReport = null;

    try {
        combinedReport = getCombinedResponseOfAllSubReports(fetchedSubReports);
    } catch (error) {
        logger.logError("Error combining sub reports!");
        logger.logError(error);
        throw new Error("Error combining sub reports!");
    }

    return combinedReport;
}

let getCombinedResponseOfAllSubReports = (subReports) => {
    logger.logInfo("Executing ReportService.getCombinedResponseOfAllSubReports() with-");
    logger.logInfo("Param 1- subReports: " + JSON.stringify(subReports));
    logger.logInfo("Number of SubReports to combine: " + subReports.length);

    let combinedResponse = {
        data: {},
        message: "No data found.",
        status: 1
    };

    for (let subReport of subReports) {
        if (!underscore.isEqual(subReport.data, {})) {
            if (underscore.isEqual(combinedResponse.data.categories, null) || underscore.isEqual(combinedResponse.data.categories, undefined)) {
                logger.logDebug("-----------------------------------------");
                logger.logDebug("Initializing combined response categories");
                logger.logDebug("-----------------------------------------");
                combinedResponse.data.categories = [];
            }
            combinedResponse.data.categories.push(getCategory(subReport.data.categories));
            let stack = subReport.data.stacks[0];
            let dropOffCounts = stack.dropOff.counts;
            for (let i = 0; i < dropOffCounts.length; i++) {
                if (underscore.isEqual(combinedResponse.data.stacks, null) || underscore.isEqual(combinedResponse.data.stacks, undefined)) {
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
            for (let i = 0; i < successCounts.length; i++) {
                combinedResponse.data.stacks[i].success.counts.push(successCounts[i]);
            }
        } else {
            logger.logDebug("Skipping subReport : " + JSON.stringify(subReport));
        }
    }

    logger.logInfo("Returning from ReportService.getCombinedResponseOfAllSubReports() with value- combinedResponse: " + JSON.stringify(combinedResponse));

    return combinedResponse;
}

let getCategory = (categories) => {
    logger.logInfo("Executing MfaSuccessByTypeReportUtil.getCategory() with Param 1: categories= " + JSON.stringify(categories));
    let category = categories[0].split("(")[1].split(")")[0];
    category = format(category);
    logger.logInfo("Returning from MfaSuccessByTypeReportUtil.getCategory() with value= " + JSON.stringify(category));
    return category;
}

let format = (str) => {
    str = str.toLowerCase().replace(/_/g, ' ');
    str = str.split(' ').map((value) => {
        return value.replace(/[a-z]/i, (str) => { return str.toUpperCase() });
    });
    str = String(str).replace(/,/g, ' ');
    return str;
}


export let getReportFromCache = async (customerId, reportId, reportType) => {
    logger.logInfo("Executing ReportService.getReportFromCache() with- ");
    logger.logInfo("Param 1: customerId= " + customerId);
    logger.logInfo("Param 2: reportId= " + reportId);
    logger.logInfo("Param 3: reportType= " + reportType);

    let report = null

    try{
        let customer =  await RedisService.get(RedisUtil.getKey(Constants.REDIS_CUSTOMER_KEY,customerId));
        if(reportType == Constants.AMPLITUDE_REPORT_TYPE_SPECIFIC){
            report = customer.reports[reportId];
        }else if(reportType == Constants.AMPLITUDE_REPORT_TYPE_ALL){
            report = customer.consolidatedReports[reportId];
        }else{
            throw new Error("Unexpected Report Type! "+reportType);
        }
    }catch(error){
       logger.logError(error);
       throw new Error("Error fetching report "+reportId);
    }

    logger.logInfo("Returning from ReportService.getReportFromCache() with value: " + JSON.stringify(report));
    return report;
}
