import expressPino from 'express-pino-logger';
import pino from 'pino';

const date = new Date();
const dateFormatted = date.getUTCDate('en-US') + "-" + (date.getUTCMonth('en-US') + 1) + "-" + date.getUTCFullYear('en-US');

const mainLogDest = pino.destination(process.env.LOG_PATH + '/main' + '_' + dateFormatted + '.log');
const mainLogger = pino({
    level: process.env.LOG_LEVEL || 'info',
    enabled: (process.env.LOG_ENABLED == "true") ? true : false,
    prettyPrint: {
        colorize: false,
        translateTime: true
    }
}, mainLogDest);

//asynchronously flush every 10 seconds to keep the buffer empty
//in periods of low activity
setInterval(function () {
    mainLogger.flush()
}, 10000).unref();

export const networkLogger = expressPino({ mainLogger });

export const logInfo = (message) => {
    try {
        mainLogger.info(message);
        console.log(message);
    } catch (error) {
        console.error(error)
    }
}

export const logDebug = (message) => {
    try {
        mainLogger.debug(message);
        console.log(message);
    } catch (error) {
        console.error(error);
    }
}

export const logFinalError = (err) => {
    try {
        let finalLogger = pino.final(mainLogger);
        finalLogger.error(err, "Uncaught Exception");
        console.error("Uncaught Exception" + err);
    } catch (error) {
        console.error(error);
    }
}

export const logError = (err) => {
    try {
        mainLogger.error(err);
        console.error(err);
    } catch (error) {
        console.error(error);
    }
}

const handler = pino.final(mainLogger, (err, finalLogger, evt) => {
    finalLogger.info(`${evt} caught`);
    if (err) finalLogger.error(err, 'error caused exit');
});

// catch all the ways node might exit
process.on('beforeExit', () => handler(null, 'beforeExit'));
process.on('exit', () => handler(null, 'exit'));
process.on('uncaughtException', (err) => handler(err, 'uncaughtException'));
process.on('SIGINT', () => handler(null, 'SIGINT'));
process.on('SIGQUIT', () => handler(null, 'SIGQUIT'));
process.on('SIGTERM', () => handler(null, 'SIGTERM'));