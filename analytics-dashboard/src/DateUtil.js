import moment from 'moment';

import * as logger from './LoggerUtil';
import * as Constants from './Constants';

export function getDate(pattern, offset) {
    let date = null;
    logger.logInfo("Executing DateUtil.getDate() with Param 1: pattern=" + pattern
        + "Param 2: offset=" + offset);

    var presentDate = new Date().toLocaleDateString('en-US', { timeZone: 'UTC' });
    presentDate = new Date(presentDate);
    logger.logDebug('The present date is: ' + presentDate);

    var desiredDate = new Date().toLocaleDateString('en-US', { timeZone: 'UTC' });
    desiredDate = new Date(desiredDate);
    desiredDate.setDate(presentDate.getDate() + offset); // minus the date
    logger.logDebug('The desired date is: ' + desiredDate);

    var formattedDate = moment(desiredDate).format(pattern);

    date = formattedDate;

    logger.logInfo("Returning from DateUtil.getDate() with value: date=" + date);

    return date;
}

export function diff(minuend, subtrahend, unit) {
    logger.logInfo("DateUtil.diff() with Params -");
    logger.logInfo("minuend: " + minuend);
    logger.logInfo("subtrahend: " + subtrahend);
    logger.logInfo("unit: " + unit);

    let diff = minuend.getTime() - subtrahend.getTime();

    if (unit == Constants.DATE_UNIT_SECONDS) {
        diff = diff / 1000;
    } else if (unit == Constants.DATE_UNIT_MINUTES) {
        diff = diff / (1000 * 60);
    } else if (unit == Constants.DATE_UNIT_HOURS) {
        diff = diff / (1000 * 60 * 60);
    } else if (unit == Constants.DATE_UNIT_DAYS) {
        diff = diff / (1000 * 60 * 60 * 24);
    }

    logger.logInfo("Returning from DateUtil.diff() with value: " + diff);
    return diff;
}

export function updateTimeStamp(data) {
    logger.logInfo("Executing DateUtil.updateTimestamp() with Param - data: " + JSON.stringify(data));
    data.lastRefreshTimestamp = new Date().toLocaleString('en-US', { timeZone: 'UTC' });
    logger.logInfo("Data last refreshed timestamp updated: " + JSON.stringify(data));
    return JSON.stringify(data);
}