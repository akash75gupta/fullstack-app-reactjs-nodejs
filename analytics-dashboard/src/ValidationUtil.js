import {TARGET_CUSTOMER_POOL} from './Constants.js';
import * as logger from './LoggerUtil';

export const isCustomerInReleaseScope = (customerId) => {
    logger.logInfo("Executing ValidationUtil.isCustomerInReleaseScope()");
    logger.logInfo("Param 1: customerId- "+customerId);
    if(TARGET_CUSTOMER_POOL.includes(customerId)){
        logger.logInfo("Returning from ValidationUtil.isCustomerInReleaseScope() with value- "+true);
        return true;
    }
    logger.logInfo("Returning from ValidationUtil.isCustomerInReleaseScope() with value- "+false);
    return false;
}