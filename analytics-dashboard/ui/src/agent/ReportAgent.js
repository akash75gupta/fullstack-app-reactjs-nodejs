import * as RestClientUtil from '../util/RestClientUtil';

export function getReports(context, updateReportForSelectedCustomer) {
  //  console.log("Executing ReportAgent.getReports() with param 1 :" + JSON.stringify(context));
  //  console.log("Fetching Reports for the given list of customers");
    let customerList = context.customerSelectionList;
    let projectId = context.projectId;
    let userInfo = context.userInfo;
    let cache = JSON.parse(sessionStorage.getItem("cache"));

    for (let customer of customerList) {
    //   console.log("Getting report for customer: "+JSON.stringify(customer));
        let customerId = customer.id;
        if (customerId === "0") {
            for (let i=0; i < 4; i++) {
                let report = cache.reports[i];
                let requestPayload = {
                    customerId: userInfo.cobrandId,
                    reportId: report.id,
                    reportType:"ALL",
                    userInfo:userInfo
                }

                RestClientUtil.dispatchRequestForReport(requestPayload)
                    .then((success) => {
                    //    console.log("Returning from ReportAgent.getReport()- value: " +JSON.stringify(success.data));
                        let reportResponse = {
                            customerId: customerId,
                            projectId: projectId,
                            reportId: report.id,
                            payload: success.data
                        }
                        updateReportInCache(reportResponse, context, updateReportForSelectedCustomer);
                    }).catch((error) => {
                        console.error("Returning from ReportAgent.getReport()- value: " + new Error(JSON.stringify(error)));
                        let reportResponse = {
                            customerId: customerId,
                            projectId: projectId,
                            reportId: report.id,
                            payload: error
                        }
                        updateReportInCache(reportResponse, context, updateReportForSelectedCustomer);
                    });
            }
        } else {
            for (let i=0; i < 4; i++) {
                let report = cache.reports[i];
                let requestPayload = {
                    customerId: customerId,
                    reportId: report.id,
                    reportType:"SPECIFIC",
                    userInfo:context.userInfo
                }

                RestClientUtil.dispatchRequestForReport(requestPayload)
                    .then((success) => {
                    //    console.log("Returning from ReportAgent.getReport()- value: " +JSON.stringify(success.data));
                        let reportResponse = {
                            customerId: customerId,
                            projectId: projectId,
                            reportId: report.id,
                            payload: success.data
                        }
                        updateReportInCache(reportResponse, context, updateReportForSelectedCustomer);
                    }).catch((error) => {
                    //    console.log("Returning from ReportAgent.getReport()- value: " + new Error(JSON.stringify(error)));
                        let reportResponse = {
                            customerId: customerId,
                            projectId: projectId,
                            reportId: report.id,
                            payload: error
                        }
                        updateReportInCache(reportResponse, context, updateReportForSelectedCustomer);
                    });
            }
        }
    }
}

 function updateReportInCache(fetchedReportResponse, context, updateReportForSelectedCustomer){
    //    console.log("Executing Dashboard.updateReportInCache(" 
    //            + JSON.stringify(fetchedReportResponse) 
    //            + "): Setting report in cache for the given customer.");
        //TODO
        let customerId = fetchedReportResponse.customerId;
        let reportId = fetchedReportResponse.reportId;
        let payload = fetchedReportResponse.payload;

        // let reports = this.state.reports;
        let cache = JSON.parse(sessionStorage.getItem("cache"));

        for (let report of cache.reports) {
            if (report.id === reportId) {
                for (let customer of report.customers) {
                    if (customer.id === customerId) {
                        customer.data = payload.data;
                        customer.lastRefreshTimestamp = payload.lastRefreshTimestamp;
                        customer.status = payload.status;
                        customer.message = payload.message;
                        break;
                    }
                }
                break;
            }
        }

        sessionStorage.setItem("cache",JSON.stringify(cache));

    //    console.log("Returning from Dashboard.updateReportInCache() with value: " + sessionStorage.getItem("cache"));

        updateReportForSelectedCustomer(context.selectedCustomer);
    }