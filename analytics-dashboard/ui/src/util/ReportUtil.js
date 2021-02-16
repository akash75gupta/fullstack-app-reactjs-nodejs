export function findReportById(reportId, reportDirectory) {
//    console.log("Executing ReportUtil.findReportById("+reportId+", "+JSON.stringify(reportDirectory)+")");
    let report = reportDirectory[reportId];
//    console.log("Returning from ReportUtil.findReportById() - value:" + JSON.stringify(report));
    return report;
  }

  export function findDataByCustomerId(customerId, report) {
//    console.log("Executing ReportUtil.findDataByCustomerId("+customerId+ ", "+JSON.stringify(report)+")");
  
    let data = null;

    for (let customer of report.customers) {
        if(customer.id === customerId){
                data = customer.data;
        }
    }
  
//    console.log("Returning from ReportUtil.findDataByCustomerId() - value: " + JSON.stringify(data));
  
    return data;
  }

export function getReportSubtitleFromLastRefreshedTimeStamp(timeStamp) {
    //console.log("Executing ReportUtil.getReportSubtitleFromLastRefreshedTimeStamp() with Param 1- timestamp: "+timeStamp);
    let formattedString = null;
    if (timeStamp !== null && timeStamp !== undefined) {
        let lastRefreshDateWithTimeStamp = new Date(new Date(timeStamp).toLocaleString("en-US", { dateStyle: 'short', timeZone: 'UTC' }));
        let presentDateWithTimeStamp = new Date(new Date().toLocaleString("en-US", { dateStyle: 'short', timeZone: 'UTC' }));
        let previousDateWithTimeStamp = new Date(new Date().toLocaleString("en-US", { dateStyle: 'short', timeZone: 'UTC' }));
        previousDateWithTimeStamp.setDate(lastRefreshDateWithTimeStamp.getDate() - 1);

        if (JSON.stringify(lastRefreshDateWithTimeStamp) === JSON.stringify(presentDateWithTimeStamp)) {
            formattedString = "Last 30 days, Data current as of today at " + new Date(Date.parse(timeStamp)).toLocaleString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true });
        } else if(JSON.stringify(lastRefreshDateWithTimeStamp) ===  JSON.stringify(previousDateWithTimeStamp)){
            formattedString = "Last 30 days, Data current as of yesterday at " + new Date(Date.parse(timeStamp)).toLocaleString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true });
        } else {
            let lastRefreshDateOnly = new Date(timeStamp).toLocaleString("en-US", { dateStyle: 'short', timeZone: 'UTC' });
            formattedString = "Last 30 days, Data current as of "+ lastRefreshDateOnly + " at " + new Date(Date.parse(timeStamp)).toLocaleString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true });
        }
    }
    //console.log("Returning from ReportUtil.getReportSubtitleFromLastRefreshedTimeStamp() f with value: "+formattedString);
    return formattedString;
}