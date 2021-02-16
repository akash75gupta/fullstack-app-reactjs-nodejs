export function getReportSpecification(projectId, reportId) {
//  console.log("Executing ProjectUtil.getReportSpecification("+JSON.stringify(projectId)+ ", "+JSON.stringify(reportId)+")");

  let project = require('../project/'+projectId.toLowerCase() +'.json');

  let specification = {
    tool: project.tool,
    report:null
  }

  for (let report of project.reports) {
    // console.log("###Test Loop: " + report);
    // console.log("### Test Loop: " + JSON.stringify(report));
    if (report.id === reportId) {
      specification.report = report;
      break;
    }
  }

//  console.log("Returning from ProjectUtil.getReportSpecification() - value:" + JSON.stringify(specification));

  return specification;
}