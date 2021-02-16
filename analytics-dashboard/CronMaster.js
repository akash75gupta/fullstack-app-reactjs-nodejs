import express from 'express';
import http from 'http';
import cron from 'node-cron';
import parser from 'body-parser';

import * as logger from './src/LoggerUtil';
import * as RedisCacheService from './src/RedisCacheService';
import * as RedisUtil from './src/RedisUtil';
import * as DateUtil from './src/DateUtil';
import * as Constants from './src/Constants';
import * as Config from './src/Config';
import * as RestClientUtil from './src/RestClientUtil';

const app = express();

//setting server
const server = http.createServer(app);
const port = process.env.CRON_MASTER_PORT;

server.listen(port, () => {
  logger.logInfo("Starting Cron Job Master: " + process.title);
  logger.logInfo("Cron Master is listening on port: " + port);
});

app.use(parser.json());

let pollWorker = null;

let workerScheduler = cron.schedule('*/' + Config.CRON_MASTER_JOB_TOTAL_DURATION + ' * * * *', async () => {
  logger.logInfo("----------------------------------------------------");
  logger.logInfo("Executing Cron Job every " + Config.CRON_MASTER_JOB_TOTAL_DURATION + " hours");
  logger.logInfo("----------------------------------------------------");
  await executeWorkers();
}, {
  scheduled: false
});

let executeWorkers = async () => {
  logger.logInfo("Executing executeWorkers()");
  let cronMasterStatus = null;
  let workers = null;
  try {
    cronMasterStatus = await RedisCacheService.get(RedisUtil.getKey("CRON_MASTER_STATUS"));
    logger.logInfo("Cron master status fetched from cache: " + JSON.stringify(cronMasterStatus));

    workers = await fetchWorkers();
    logger.logInfo("Workers fetched successfully!");
    logger.logInfo(workers);

    if (cronMasterStatus == null || cronMasterStatus == undefined) {
      cronMasterStatus = initMasterStatus(workers);
    } else {
      cronMasterStatus = resetMasterStatus(cronMasterStatus, workers);
    }
    await updateMasterStatus(cronMasterStatus);
    if (workers != undefined && workers != null || workers.length > 0) {
      await executeNextWorker();
    }else{
      logger.logInfo("No workers found");
    }
  } catch (error) {
    logger.logError(error);
  }
  logger.logInfo("Returning from executeWorkers()");
}

//schedule tasks to be run on the server
(async function main() {
  if (process.env.CRON_MASTER_STATUS == "ACTIVE") {
    await executeWorkers();
    workerScheduler.start();
  }
})();

let updateMasterStatus = async (cronMasterStatus) => {
  logger.logInfo("Executing updateMasterStatus() with Param 1 - cronMasterStatus: " + JSON.stringify(cronMasterStatus));
  try {
    await RedisCacheService.save(RedisUtil.getKey(Constants.REDIS_CRON_MASTER_STATUS_KEY), cronMasterStatus);
    logger.logInfo("Master status successfully updated in cache!");
  } catch (error) {
    logger.logError(error);
    throw new Error("Error updating status in cache!");
  }
  logger.logInfo("Returning from updateMasterStatus()");
}

let initMasterStatus = (workerList) => {
  logger.logInfo("Executing initMasterStatus()");
  let cronMasterStatus = {};
  cronMasterStatus.status = Constants.STATUS_STARTED;
  cronMasterStatus.lastStatusUpdate = DateUtil.getDate(Constants.DATE_FORMAT_ISO, 0);
  cronMasterStatus.lastSuccessDate = null;
  cronMasterStatus.workerExecutionQueue = workerList.reverse();
  cronMasterStatus.successfulWorkers = [];
  cronMasterStatus.failedWorkers = [];
  cronMasterStatus.retryAttempts = 3;
  logger.logInfo("Returning from initMasterStatus() with value: " + JSON.stringify(cronMasterStatus));
  return cronMasterStatus;
}

let resetMasterStatus = (cronMasterStatus, workerList) => {
  logger.logInfo("Executing resetMasterStatus() with Param 1- cronMasterStatus: " + cronMasterStatus);
  cronMasterStatus.status = Constants.STATUS_STARTED;
  cronMasterStatus.lastStatusUpdate = DateUtil.getDate(Constants.DATE_FORMAT_ISO, 0);
  cronMasterStatus.workerExecutionQueue = workerList.reverse();
  cronMasterStatus.successfulWorkers = [];
  cronMasterStatus.failedWorkers = [];
  cronMasterStatus.retryAttempts = 3;
  logger.logInfo("Returning from resetMasterStatus() with value: " + JSON.stringify(cronMasterStatus));
  return cronMasterStatus;
}

let fetchWorkers = async () => {
  logger.logInfo("Executing fetchWorkers()");
  let workers = null;
  try {
    let url = process.env.ZOOKEEPER_URL + "/workers";
    workers = await RestClientUtil.httpGet(url);
  } catch (error) {
    logger.logError(error);
    throw new Error("Error fetching workers from Zookeeper!");
  }

  logger.logInfo("Returning from fetchWorkers() with value: "+JSON.stringify(workers));

  return workers;
}

let executeNextWorker = async () => {
  logger.logInfo("-------------------------------------------------------------------");
  logger.logInfo("Executing executeNextWorker()");
  logger.logInfo("--------------------------------------------------------------------");
  let worker = null;
  let cronMasterStatus = null;
  try {
    cronMasterStatus = await RedisCacheService.get(RedisUtil.getKey("CRON_MASTER_STATUS"));
    logger.logInfo("Cron master status fetched from cache: " + JSON.stringify(cronMasterStatus));
    worker = await getNextWorker();
  } catch (error) {
    logger.logError("Error occurred before executing worker!");
    logger.logError(error);
    logger.logInfo("Returning from CronMaster.executeNextWorker()");
    return;
  }

  if (worker == undefined || worker == null) {
    logger.logInfo("No worker found");
    logger.logInfo("Returning from CronMaster.executeNextWorker()");
    return;
  }

  logger.logInfo("-------------------------------------------------------------------");
  logger.logInfo("Next worker: " + JSON.stringify(worker));
  logger.logInfo("--------------------------------------------------------------------");

  pollWorker = setInterval(async () => {
    let isTerminated = await isWorkerTerminated(worker);
    if(!isTerminated){
      let isAlive = await isWorkerAlive(worker.url);
      if (isAlive == false) {
        logger.logInfo("Stop polling worker of "+worker.dataCenter+" since it is dead.");        
        clearInterval(pollWorker);
        await terminateWorker(Constants.STATUS_FAILED);
        await executeNextWorker();
      }
    }else{
      logger.logInfo("Stop polling worker of "+worker.dataCenter+" since it is terminated.");        
      clearInterval(pollWorker);
    }
  }, 10000);

  try {
    let url = worker.url + Config.WORKER_START_END_POINT;
    let queryParam = "?callbackUrl=" + process.env.CRON_MASTER_URL + "/api/cron/master/workerStatus";
    let finalUrl = url + queryParam;
    let response = await RestClientUtil.httpGet(finalUrl);

    logger.logInfo("Worker response: " + JSON.stringify(response));
    logger.logInfo("Worker started successfully for the DC- " + JSON.stringify(worker));
  } catch (error) {
    logger.logInfo("Worker- " + JSON.stringify(worker) + " failed to start!");
    logger.logError(error);
    await terminateWorker(Constants.STATUS_FAILED);
    await executeNextWorker();
  }
  logger.logInfo("Returning from CronMaster.executeNextWorker()");
}

let getNextWorker = async () => {
  logger.logInfo("Execute getNextWorker()");
  let nextWorker = null;
  try {
    let cronMasterStatus = await RedisCacheService.get(RedisUtil.getKey(Constants.REDIS_CRON_MASTER_STATUS_KEY));
    nextWorker = cronMasterStatus.workerExecutionQueue[cronMasterStatus.workerExecutionQueue.length - 1];
  } catch (error) {
    logger.logError(error);
    throw new Error("Error fetching next worker!");
  }

  logger.logInfo("Returning from getNextWorker() with value: " + JSON.stringify(nextWorker));
  return nextWorker;
}

let isWorkerTerminated = async (worker) => {
  logger.logInfo("Executing CronMaster.isTerminated()");
  logger.logInfo("Param 1- worker: "+JSON.stringify(worker));
  console.log("Executing CronMaster.isTerminated()");
  console.log("Param 1- worker: "+JSON.stringify(worker));

  let isTerminated = null;

  try{
    let cronMasterStatus = await RedisCacheService.get(RedisUtil.getKey(Constants.REDIS_CRON_MASTER_STATUS_KEY));
    logger.logInfo("Cron master status fetched from cache: " + JSON.stringify(cronMasterStatus));
    
    isTerminated = true;
    for(let workerInQueue of cronMasterStatus.workerExecutionQueue){
      if(workerInQueue.dataCenter == worker.dataCenter){
        isTerminated = false;
        break;
      }
    }
  }catch(error){
    logger.logError(error);
    throw new Error("Error checking if worker is terminated!");
  }

  logger.logInfo("Returning from CronMaster.isTerminated() with value: "+isTerminated);
  return isTerminated;
}

let terminateWorker = async (status) => {
  logger.logInfo("Executing terminateWorker()");
  logger.logInfo("Param 1- status: " + status);

  let cronMasterStatus = null;

  cronMasterStatus = await RedisCacheService.get(RedisUtil.getKey("CRON_MASTER_STATUS"));
  logger.logInfo("Cron master status fetched from cache: " + JSON.stringify(cronMasterStatus));

  let worker = cronMasterStatus.workerExecutionQueue.pop();

  if (status == Constants.STATUS_SUCCESS) {
    cronMasterStatus.successfulWorkers.push(worker);
    logger.logInfo("****************************************************************************");
    logger.logInfo("Execution successful for worker: " + JSON.stringify(worker));
    logger.logInfo("****************************************************************************");
  } else {
    cronMasterStatus.failedWorkers.push(worker);
    if (cronMasterStatus.status != Constants.STATUS_FAILED) {
      cronMasterStatus.status = Constants.STATUS_FAILED;
      cronMasterStatus.lastStatusUpdate = DateUtil.getDate(Constants.DATE_FORMAT_ISO, 0);
    }
    logger.logInfo("#############################################################################");
    logger.logInfo("Execution failed for worker: " + JSON.stringify(worker));
    logger.logInfo("##############################################################################");
  }

  if (cronMasterStatus.workerExecutionQueue.length <= 0) {
    if (cronMasterStatus.failedWorkers.length <= 0) {
      cronMasterStatus.status = Constants.STATUS_SUCCESS;
      cronMasterStatus.lastStatusUpdate = DateUtil.getDate(Constants.DATE_FORMAT_ISO, 0);
      cronMasterStatus.lastSuccessDate = DateUtil.getDate(Constants.DATE_FORMAT_ISO, 0);
    }
    logger.logInfo("*********************************************************************************");
    logger.logInfo("Finished executing all the workers. Job Complete for the present cycle!");
    logger.logInfo("*********************************************************************************");
  }

  try {
    await updateMasterStatus(cronMasterStatus);
  } catch (error) {
    logger.logError(error);
  }
  logger.logInfo("Stop polling worker of "+worker.dataCenter+" since it is terminated.");        
  clearInterval(pollWorker);
  logger.logInfo("Returning from terminateWorker()");
}

let isWorkerAlive = async (workerUrl) => {
    logger.logInfo("Executing isWorkerAlive() - Checking if worker is alive.");
    logger.logInfo("Param 1- workerUrl: " + workerUrl);
    let isAlive = null;
    let url= workerUrl + "/api/cron/worker/isAlive"
  
    try{
      await RestClientUtil.httpGet(url);
      isAlive = true;
    }catch(error){
      isAlive = false;
      logger.logInfo(error);
    }

    logger.logInfo("Returning from isWorkerAlive() with value: "+isAlive);
    return isAlive;
}

app.post('/api/cron/master/workerStatus', async (req, res) => {
  var fullWorkerUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  logger.logInfo("Executing API call /api/cron/master/workerStatus for " + fullWorkerUrl);
  try {
    logger.logInfo(req.body);
    let workerStatus = null;

    try {
      let { status } = req.body;
      workerStatus = status;

      if (status != Constants.STATUS_SUCCESS && status != Constants.STATUS_FAILED) {
        throw new Error("Invalid status- " + status);
      }
    } catch (error) {
      res.status(400).send({
        error: "Bad Request! " + error.message
      });
      return;
    }

    await terminateWorker(workerStatus);
    res.status(200).send({
      message: "Response Acknowledged!"
    });

  } catch (error) {
    logger.logError("Error processing worker status");
    logger.logError(error);
    res.status(200).send({
      message: error.message
    });
  }

  await executeNextWorker();
});

//tracing uncaught exceptions
app.use((err) => {
  logger.logFinalError(err);
});