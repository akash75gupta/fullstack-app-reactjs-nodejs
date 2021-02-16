import express from 'express';
import http from 'http';
import cron from 'node-cron';
import request from 'request';
import urlParser from 'url';

import * as RedisCacheService from './src/RedisCacheService';
import * as RestClientUtil from './src/RestClientUtil';
import * as logger from './src/LoggerUtil';
import * as RedisUtil from './src/RedisUtil';
import * as DateUtil from './src/DateUtil';
import * as Constants from './src/Constants';
import * as ReportService from './src/ReportService';
import * as Config from './src/Config';
import * as CustomerService from './src/CustomerService';

const app = express();

//setting server
const server = http.createServer(app);
const port = process.env.CRON_WORKER_PORT;

server.listen(port, () => {
  logger.logInfo("Starting Cron Job Worker: " + process.title);
  logger.logInfo("Cron Worker is listening on port: " + port);
});

let executeGetCustomerJob = async () => {
  logger.logInfo("Executing CronWorker.executeGetCustomerJob()");
  let customers = null;
  let cronWorkerGetCustomerStatus = null;
  try {
    cronWorkerGetCustomerStatus = await RedisCacheService.get(RedisUtil.getKey("CRON_WORKER_GET_CUSTOMER_STATUS"));
    logger.logInfo("Cron worker GET CUSTOMER status fetched from cache: " + JSON.stringify(cronWorkerGetCustomerStatus));

    customers = await getCustomersFromDB();
    for (let customer of customers) {
      let customerExists = null;
      customerExists = await CustomerService.customerExistsInCache(customer);
      if (!customerExists) {
        let numberOfCustomersAdded = null;
        numberOfCustomersAdded = await RedisCacheService.addToList(RedisUtil.getKey("CUSTOMER_LIST"), customer);
        logger.logInfo(numberOfCustomersAdded + " customers added to cache");
        await RedisCacheService.save(RedisUtil.getKey("CUSTOMER", customer), initCustomerStatus());
      }
    }
  } catch (error) {
    logger.logError(error);
    cronWorkerGetCustomerStatus.status = Constants.STATUS_FAILED;
    cronWorkerGetCustomerStatus.lastStatusUpdate = DateUtil.getDate(Constants.DATE_FORMAT_ISO,0);
    await updateStatus("CRON_WORKER_GET_CUSTOMER_STATUS", cronWorkerGetCustomerStatus);

    logger.logError("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    logger.logError("GET CUSTOMER Job failed!");
    logger.logError("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

    throw new Error("Error executing GET_CUSTOMER Job!");
  }
  cronWorkerGetCustomerStatus.status = Constants.STATUS_SUCCESS;
  cronWorkerGetCustomerStatus.lastStatusUpdate = DateUtil.getDate(Constants.DATE_FORMAT_ISO,0);
  cronWorkerGetCustomerStatus.lastSuccessDate = DateUtil.getDate(Constants.DATE_FORMAT_ISO,0);
  await updateStatus("CRON_WORKER_GET_CUSTOMER_STATUS", cronWorkerGetCustomerStatus);
  logger.logInfo("*******************************************************************");
  logger.logInfo("GET CUSTOMER job completed. Worker started successfully!");
  logger.logInfo("*******************************************************************");

  logger.logInfo("Returning from CronWorker.executeGetCustomerJob()");
}

let executeGetReportJob = async (getReportJobScheduler) => {
  logger.logInfo("Executing CronWorker.executeGetReport()");
  let cronWorkerGetReportStatus = null;
  let customersFromCache = null;
  try {
    cronWorkerGetReportStatus = await RedisCacheService.get(RedisUtil.getKey(Constants.REDIS_CRON_WORKER_GET_REPORT_STATUS_KEY));
    logger.logInfo("Cron worker GET REPORT status fetched from cache: " + JSON.stringify(cronWorkerGetReportStatus));

    let lastOffset = cronWorkerGetReportStatus.offset;
    logger.logInfo("??????????????? Last offset: "+lastOffset);

    customersFromCache = await RedisCacheService.getList(RedisUtil.getKey("CUSTOMER_LIST"));
    logger.logInfo("Customers fetched from cache" + JSON.stringify(customersFromCache));

    for (let i = 0; i < Config.CRON_WORKER_GET_REPORT_JOB_LAP_THROUGHPUT && lastOffset < customersFromCache.length -1; i++) {
      let customer = customersFromCache[lastOffset+1];
      let customerStatus = null;
      customerStatus = await CustomerService.getCustomerStatus(customer);
      if (customerStatus != null &&  customerStatus != undefined &&  customerStatus.lastSuccessDate != null &&  DateUtil.diff(new Date(DateUtil.getDate(Constants.DATE_FORMAT_ISO,0)),new Date(customerStatus.lastSuccessDate),Constants.DATE_UNIT_HOURS) < 48) {
            i--;
            lastOffset++;
            cronWorkerGetReportStatus.offset = lastOffset;
            await updateStatus("CRON_WORKER_GET_REPORT_STATUS", cronWorkerGetReportStatus);
            logger.logInfo("!!!!!!Skipping customer: "+customer);
            continue;
      } else if( customerStatus != null ||  customerStatus != undefined ){
        initCustomerStatus(customerStatus);
      }else {
        resetCustomerStatus(customerStatus);
      }
    
      await updateStatus("CUSTOMER_" + customer, customerStatus);

      let reports = null;
      try {
        reports = await ReportService.getReports(customer);
        logger.logInfo("Reports fetched successfully!");
        logger.logInfo(JSON.stringify(reports));
        customerStatus.status = Constants.STATUS_SUCCESS;
        customerStatus.lastStatusUpdate = DateUtil.getDate(Constants.DATE_FORMAT_ISO,0);
        customerStatus.lastSuccessDate = DateUtil.getDate(Constants.DATE_FORMAT_ISO,0);
        customerStatus.reports = reports;
        await updateStatus("CUSTOMER_" + customer, customerStatus);
      } catch (error) {
        customerStatus.status = Constants.STATUS_FAILED;
        customerStatus.lastStatusUpdate = DateUtil.getDate(Constants.DATE_FORMAT_ISO,0);
        customerStatus.reports = reports;
        logger.logError(error);
        try{
          await updateStatus("CUSTOMER_" + customer, customerStatus);
        }catch(error){
          logger.logError(error);
        }
        throw new Error("Error processing customer: " + customer + "!");
      }
      lastOffset++;
      logger.logInfo("??????????????? Offset incremented: "+lastOffset);
      cronWorkerGetReportStatus.offset = lastOffset;
      await updateStatus("CRON_WORKER_GET_REPORT_STATUS", cronWorkerGetReportStatus);
    }
    
    logger.logInfo("??????");
    logger.logInfo("?????? Test = lastOffset: "+lastOffset+", customersFromCache.length -1: "+(customersFromCache.length -1));
    logger.logInfo("??????");
    if(lastOffset == customersFromCache.length -1){
      cronWorkerGetReportStatus.status = Constants.STATUS_SUCCESS;
      cronWorkerGetReportStatus.lastStatusUpdate = DateUtil.getDate(Constants.DATE_FORMAT_ISO,0);
      cronWorkerGetReportStatus.lastSuccessDate = DateUtil.getDate(Constants.DATE_FORMAT_ISO,0);
      await updateStatus("CRON_WORKER_GET_REPORT_STATUS", cronWorkerGetReportStatus);
      
      logger.logInfo("*******************************************************************");
      logger.logInfo("GET REPORT job completed. Worker started successfully!");
      logger.logInfo("*******************************************************************");

      getReportJobScheduler.stop();
      logger.logInfo("############## GET REPORT JOB STOPPED !!! ##############");
    }
  } catch (error) {
    logger.logError(error);
    cronWorkerGetReportStatus.status = Constants.STATUS_FAILED;
    cronWorkerGetReportStatus.lastStatusUpdate = DateUtil.getDate(Constants.DATE_FORMAT_ISO,0);
    await updateStatus("CRON_WORKER_GET_REPORT_STATUS", cronWorkerGetReportStatus);
    
    logger.logInfo("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    logger.logInfo("GET REPORT job failed!");
    logger.logInfo("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

    getReportJobScheduler.stop();
    logger.logInfo("############## GET REPORT JOB STOPPED !!! ##############");

    throw new Error("Error executing GET REPORT job!");
  }

  logger.logInfo("Returning from CronWorker.executeGetReport() with value: "+JSON.stringify(cronWorkerGetReportStatus));
  return cronWorkerGetReportStatus;
}

let informMaster = async (cronWorkerStatus) => {
  logger.logInfo("Executing informMaster() with-");
  logger.logInfo("Param 1- cronWorkerStatus: "+ JSON.stringify(cronWorkerStatus));
  
  try{
    let url = cronWorkerStatus.masterCallbackUrl;
    let body = {
      status: cronWorkerStatus.status
    };
  
  let response = await RestClientUtil.httpPost(url,body);
  logger.logInfo("Response from Master: "+JSON.stringify(response));

  }catch(error){
    logger.logInfo(error);
    throw new Error("Error informing master!");
  }
  logger.logInfo("Returning from informMaster()");
}

let updateStatus = async (key, status) => {
  logger.logInfo("Executing updateStatus() with Param 1 - key: " + key + " and Param 2 - status: " + JSON.stringify(status));
  try {
    await RedisCacheService.save(RedisUtil.getKey(key), status);
    logger.logInfo("Status successfully updated in cache!");
  } catch (error) {
    logger.logError("Error updating status in cache!");
    logger.logError(error);
    throw new Error("Error updating status in cache!");
  }
  logger.logInfo("Returning from updateStatus()");
}

let initGetCustomerJob = async () => {
  logger.logInfo("Executing initGetCustomerJob()");
  let cronWorkerGetCustomerStatus = null;
  try {
    cronWorkerGetCustomerStatus = await RedisCacheService.get(RedisUtil.getKey("CRON_WORKER_GET_CUSTOMER_STATUS"));
    logger.logInfo("Cron worker GET CUSTOMER status fetched from cache: " + JSON.stringify(cronWorkerGetCustomerStatus));

    if (cronWorkerGetCustomerStatus == null || cronWorkerGetCustomerStatus == undefined) {
      cronWorkerGetCustomerStatus = initWorkerGetCustomerStatus();
    } else {
      cronWorkerGetCustomerStatus = resetWorkerGetCustomerStatus(cronWorkerGetCustomerStatus);
    }
    await updateStatus("CRON_WORKER_GET_CUSTOMER_STATUS", cronWorkerGetCustomerStatus);
  } catch (error) {
    logger.logError(error);
    throw new Error("Error initializing GET_CUSTOMER job!");
  }

  logger.logInfo("Returning from initGetCustomerJob()");
}

let initGetReportJob = async (queryParams) => {
  logger.logInfo("Executing initGetReportJob() with-");
  logger.logInfo("Param 1 - queryParams: "+JSON.stringify(queryParams));

  let cronWorkerGetReportStatus = null;

  try {
    cronWorkerGetReportStatus = await RedisCacheService.get(RedisUtil.getKey("CRON_WORKER_GET_REPORT_STATUS"));
    logger.logInfo("Cron worker GET REPORT status fetched from cache: " + JSON.stringify(cronWorkerGetReportStatus));

    if (cronWorkerGetReportStatus == null || cronWorkerGetReportStatus == undefined) {
      cronWorkerGetReportStatus = initWorkerGetReportStatus(queryParams);
    } else {
      cronWorkerGetReportStatus = resetWorkerGetReportStatus(cronWorkerGetReportStatus,queryParams);
    }
    await updateStatus("CRON_WORKER_GET_REPORT_STATUS", cronWorkerGetReportStatus);
  } catch (error) {
    logger.logError(error);
    throw new Error("Error initializing GET_REPORT job!");
  }

  logger.logInfo("Returning from initGetReportJob()");
  return cronWorkerGetReportStatus;
}

let initWorkerGetCustomerStatus = () => {
  logger.logInfo("Executing initWorkerGetCustomerStatus()");
  let cronWorkerGetCustomerStatus = {};
  cronWorkerGetCustomerStatus.status = Constants.STATUS_STARTED;
  cronWorkerGetCustomerStatus.lastStatusUpdate = "2019-01-09T18:30:00Z";
  cronWorkerGetCustomerStatus.lastSuccessDate = null;
  cronWorkerGetCustomerStatus.retryAttempts = 3;
  logger.logInfo("Returning from initWorkerGetCustomerStatus() with value: " + JSON.stringify(cronWorkerGetCustomerStatus));
  return cronWorkerGetCustomerStatus;
}

let resetWorkerGetCustomerStatus = (cronWorkerGetCustomerStatus) => {
  logger.logInfo("Executing resetStatus() for resetWorkerGetCustomerStatus: " + JSON.stringify(cronWorkerGetCustomerStatus));
  cronWorkerGetCustomerStatus.status = Constants.STATUS_STARTED;
  cronWorkerGetCustomerStatus.lastStatusUpdate = "2019-01-09T18:30:00Z";
  logger.logInfo("Returning from resetWorkerStatus() with value: " + JSON.stringify(cronWorkerGetCustomerStatus));
  return cronWorkerGetCustomerStatus;
}

let initWorkerGetReportStatus = (queryParams) => {
  logger.logInfo("Executing initWorkerGetReportStatus() with-");
  logger.logInfo("Param 1- queryParams: "+JSON.stringify(queryParams));
  let cronWorkerGetReportStatus = {};
  cronWorkerGetReportStatus.status = Constants.STATUS_STARTED;
  cronWorkerGetReportStatus.lastStatusUpdate = "2019-01-09T18:30:00Z";
  cronWorkerGetReportStatus.lastSuccessDate = null;
  cronWorkerGetReportStatus.offset = -1;
  cronWorkerGetReportStatus.retryAttempts = 3;
  cronWorkerGetReportStatus.masterCallbackUrl = queryParams.callbackUrl;
  logger.logInfo("Returning from initStatus() with value: " + JSON.stringify(cronWorkerGetReportStatus));
  return cronWorkerGetReportStatus;
}

let resetWorkerGetReportStatus = (cronWorkerGetReportStatus,queryParams) => {
  logger.logInfo("Executing resetWorkerGetReportStatus() with-");
  logger.logInfo("Param 1- cronWorkerGetReportStatus: "+JSON.stringify(cronWorkerGetReportStatus));
  logger.logInfo("Param 1- queryParams: "+JSON.stringify(queryParams));
  cronWorkerGetReportStatus.status = Constants.STATUS_STARTED;
  cronWorkerGetReportStatus.lastStatusUpdate = "2019-01-09T18:30:00Z";
  cronWorkerGetReportStatus.offset = -1;
  cronWorkerGetReportStatus.retryAttempts = 3;
  cronWorkerGetReportStatus.masterCallbackUrl = queryParams.callbackUrl;
  logger.logInfo("Returning from resetWorkerGetReportStatus() with value: " + JSON.stringify(cronWorkerGetReportStatus));
  return cronWorkerGetReportStatus;
}

let initCustomerStatus = () => {
  logger.logInfo("Executing initCustomerStatus()");
  let customerStatus = {};
  customerStatus.status = null;
  customerStatus.lastStatusUpdate = null
  customerStatus.lastSuccessDate = null;
  customerStatus.reports = {};
  customerStatus.retryAttempts = 3;
  logger.logInfo("Returning from initStatus() with value: " + JSON.stringify(customerStatus));
  return customerStatus;
}

let resetCustomerStatus = (customerStatus) => {
  logger.logInfo("Executing resetStatus() for resetCustomerStatus: " + JSON.stringify(customerStatus));
  customerStatus.status = Constants.STATUS_STARTED;
  customerStatus.lastStatusUpdate = DateUtil.getDate(Constants.DATE_FORMAT_ISO, 0);
  logger.logInfo("Returning from resetWorkerStatus() with value: " + JSON.stringify(customerStatus));
  return customerStatus;
}

let getCustomersFromDB = () => {
  return new Promise((resolve, reject) => {
    logger.logInfo("Executing fetchCustomersFromDB()");
    let options = {
      method: "GET",
      url: process.env.SOT_URL + "/customers"
    }
    request(options, function (error, response, body) {
      if (error) {
        logger.logError(error);
        reject(new Error("Error fetching customer from DB!"));
      } else if (response.statusCode != 200) {
        logger.logError("Error Response! Status Code: " + response.statusCode);
        reject(new Error("Error fetching customer from DB!"));
      } else {
        resolve(JSON.parse(body));
        logger.logInfo("Returning from fetchCustomersFromDB() with value: " + JSON.stringify(JSON.parse(body)));
      }
    });
  });
}

app.get('/api/cron/worker/start', async (req, res) => {
    var fullWorkerUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    logger.logInfo("Executing API call /api/cron/start/worker for " + fullWorkerUrl);

    let queryParams = urlParser.parse(req.url,true).query;
    logger.logInfo("Query Params: " + JSON.stringify(queryParams));

    /************************************************************************************************************************/
    /////////////////////////// JOB 1: Get list of customer from DB using SOT API and save in cache //////////////////////////
    /************************************************************************************************************************/
    try {
      await initGetCustomerJob();
      await executeGetCustomerJob();
      res.status(200).json({
        message: "Worker started successfully!"
      });
    } catch (error) {
      logger.logError(error);
      res.status(500).json({
        errorMessage: "Error starting worker! GET CUSTOMER Job failed."
      });
      return;
    }
    /////////////////////////////////////////////////// JOB 1 COMPLETE ////////////////////////////////////////////////////////

    let cronWorkerGetReportStatus = null;
    try {
      cronWorkerGetReportStatus= await initGetReportJob(queryParams);
    /*************************************************************************************************************************/
    //////////////////////////// JOB 2: Get Reports of the all the customers from Amplitude ///////////////////////////////////
    /*************************************************************************************************************************/
    // schedule tasks to be run on the server
    let getReportJobScheduler = cron.schedule('*/'+Config.CRON_WORKER_GET_REPORT_JOB_LAP_DURATION+' * * * *', async () => {
      logger.logInfo("-------------------------------------");
      logger.logInfo("Executing Cron Worker every "+Config.CRON_WORKER_GET_REPORT_JOB_LAP_DURATION+" minutes");
      logger.logInfo("-------------------------------------");
      let cronWorkerGetReportStatus = null;
      try {
        cronWorkerGetReportStatus = await executeGetReportJob(getReportJobScheduler);
        try{
          await informMaster(cronWorkerGetReportStatus);
        }catch(error){
          console.log(error)
        }
      } catch (error) {
        logger.logError("Error occurred in Worker!");
        logger.logError(error);   
        try{
          await informMaster(cronWorkerGetReportStatus);
        }catch(error){
          console.log(error)
        }
      }
    });

    cronWorkerGetReportStatus = await executeGetReportJob(getReportJobScheduler);
    //////////////////////////////////////////////// JOB 2 COMPLETE //////////////////////////////////////////////////////////
    try{
      await informMaster(cronWorkerGetReportStatus);
    }catch(error){
      console.log(error)
    }
  } catch (error) {
    logger.logError("Error occurred in Worker!");
    logger.logError(error);
    try{
      await informMaster(cronWorkerGetReportStatus);
    }catch(error){
      console.log(error)
    }
  }
});

app.get('/api/cron/worker/isAlive', async (req, res) => {
  var fullWorkerUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  logger.logInfo("Executing API call /api/cron/worker/isAlive for " + fullWorkerUrl);
  // schedule tasks to be run on the server
  res.status(200).send({
    message: "Worker is alive!"
  });
});

//tracing uncaught exceptions
app.use((err) => {
  logger.logFinalError(err);
});