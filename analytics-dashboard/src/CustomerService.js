import * as logger from './LoggerUtil';
import * as RedisCacheService from './RedisCacheService';
import * as RedisUtil from './RedisUtil';

export let getAmplitudeStatus = async (customerId, strictMode) => {
    logger.logInfo("Executing AmplitudeClient.dispatchRequestForUserSearch() with- ");
    logger.logInfo("Param 1- customerId: "+customerId);
    logger.logInfo("Param 2- strictMode: "+strictMode);

    let status = null;
  
    try{
      let customerExists = await customerExistsInCache(customerId);
      if(customerExists){
        status = {
          amplitudeEnabled: true
        };
      }else if (strictMode != undefined && strictMode != null && !strictMode) {
        logger.logInfo("Check status of sub-brands if any");
        logger.logInfo("??????????????? Non strict mode - Under Implementation ????????????????");
        //TO DO: Implement the logic for strictMode  - false. Check amplitude status of sub-brands if strictMode==false.
        //Temporarily defaulting to amplitudeEnabled as false.
        status = {
          amplitudeEnabled: false
        };
      }else{
        status = {
          amplitudeEnabled: false
        };
      }
    }catch(error) {
        logger.logError(error);
        throw new Error("Error fetching amplitude status for the customer: "+customerId);
    }
  
    logger.logInfo("Returning from AmplitudeClient.dispatchRequestForUserSearch(): "+JSON.stringify(status));
  
    return status;
  }

  export let customerExistsInCache = async (customer) => {
    logger.logInfo("Executing customerExistsInCache() with Param - customer: " + customer);
    let customerExists = null;
  
    let customerStatus = null;
    try {
      customerStatus = await getCustomerStatus(customer);
    } catch (error) {
      logger.logError(error);
      throw new Error("Error fetching status of the customer: " + customer);
    }
  
    if (customerStatus == null || customerStatus == undefined) {
      customerExists = false;
    } else {
      customerExists = true;
    }
  
    logger.logInfo("Returning from customerExistsInCache() with value: " + customerExists);
    return customerExists;
  }

  export let getCustomerStatus = async (customer) => {
    logger.logInfo("Executing getCustomerStatus() for customer: " + customer);
    let customerStatus = null;
    try {
      customerStatus = await RedisCacheService.get(RedisUtil.getKey("CUSTOMER", customer));
    } catch (error) {
      logger.logError(error);
      throw new Error("Error fetching status of the customer: " + customer);
    }
    logger.logInfo("Returning from getCustomerStatus() with value: " + JSON.stringify(customerStatus));
    return customerStatus;
  }