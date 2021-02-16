import NodeCache from  "node-cache" ;

let pdfCache = new NodeCache();

export const getReports = () =>{
//    console.log("Get Reports from Pdf Cache");
    return pdfCache.get("reports");
}

export const saveReports = (reports) =>{
//    console.log("Save Reports into Pdf Cache - "+JSON.stringify(reports));
    pdfCache.set("reports", reports);
}
