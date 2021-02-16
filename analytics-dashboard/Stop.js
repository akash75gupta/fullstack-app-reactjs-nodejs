import { kill } from 'cross-port-killer';

import * as logger from './src/LoggerUtil';

const port = process.env.PORT;
logger.logDebug("Application is running on PORT: "+port);

kill(port).then(pids => {
    logger.logInfo("#### Application Stopped ####");
    logger.logInfo("The following processes were terminated:");
    logger.logInfo(pids);
}).catch((error)=>{
    logger.logDebug(error);
});
