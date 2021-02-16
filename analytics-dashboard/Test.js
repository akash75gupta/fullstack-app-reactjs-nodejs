
import express from 'express';
import http from 'http';

import * as DateUtil from './src/DateUtil';
import * as Config from './src/Config';
import * as Constants from './src/Constants';

const app = express();

//setting server
const server = http.createServer(app);
const port = process.env.TEST_PORT;

server.listen(port, () => {
  process.title = "test_app";
  console.log("Starting: " + process.title);
  console.log("Listening on port: " + port);

  let x = "{\"key\":\"value\"}";

  try{
  x = JSON.parse(x);
  console.log("Parsed x: "+x);
  }catch(error){
    console.log(error);
  }
});
 
// let job = cron.schedule('*/30 * * * * *', () => {
//   console.log('running every 30 seconds');
// });
//console.log("Job started");

console.log("Date Difference: "+ DateUtil.diff(new Date("2020-04-22T00:04:00+05:30"), new Date(DateUtil.getDate(Constants.DATE_FORMAT_ISO,0)),"HOURS"));

//schedule tasks to be run on the server
(async function main() {
  isTerminated({
    "dataCenter": "SC9",
    "url": "http://localhost:3020"
  });

  isTerminated({
    "dataCenter": "CA",
    "url": "http://localhost:3021"
  });

})();

app.get('/test/api/customers', function (req, res) {
  console.log("Executing API call /customers - Get list of customers.");
  let customers = Config.TARGET_CUSTOMER_POOL;
  console.log(customers);
  res.send(customers)
});

app.get('/test/api/workers', function (req, res) {
  console.log("Executing API call /workers - Get list of workers.");
  let dataCenters = Config.WORKERS;
  console.log("Returning from API call /workers with value: "+JSON.stringify(dataCenters));
  res.send(dataCenters);
});

//tracing uncaught exceptions
app.use((err) => {
  console.log(err);
});

function isTerminated(worker) {
  console.log("Executing CronMaster.isTerminated()");
  console.log("Param 1- worker: "+JSON.stringify(worker));

  let isTerminated = null;

  try{
   let cronMasterStatus = {
      "status":"FAILED",
      "lastStatusUpdate":"2020-04-27T00:04:00+05:30",
      "lastSuccessDate":null,
      "workerExecutionQueue":[ 
        {
          "dataCenter":"SC9",
          "url":"http://localhost:3020"
        }
      ],
      "successfulWorkers":[],
      "failedWorkers":[
       {
          "dataCenter":"CA",
          "url":"http://localhost:3021"
        }
      ],
      "retryAttempts":3
    }

    console.log("Cron master status fetched from cache: " + JSON.stringify(cronMasterStatus));
    
    isTerminated = true;
    for(let workerInQueue of cronMasterStatus.workerExecutionQueue){
      if(workerInQueue.dataCenter == worker.dataCenter){
        isTerminated = false;
        break;
      }
    }
    
  }catch(error){
    console.log(error);
    throw new Error("Error checking if worker is terminated!");
  }

  console.log("Returning from CronMaster.isTerminated() with value: "+isTerminated);
}
