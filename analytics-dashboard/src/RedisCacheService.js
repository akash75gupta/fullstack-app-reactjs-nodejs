import Redis from 'ioredis';
import * as logger from './LoggerUtil';
import * as RedisUtil from './RedisUtil';
import * as Config from './Config';

let redis = null;

try {
    redis = new Redis(RedisUtil.getServerOpts());
    let count = 1;
    redis.on('error', err => {
        logger.logDebug('Attempting to connect with redis: ' + count);
        if (count === 3) {
            redis.disconnect();
            logger.logError("Redis connection Max retry attempts reached!");
            logger.logError(err.message);
        }
        count++;
    });
} catch (error) {
    logger.logError("Error connecting to Redis!");
    logger.logError(error);
}

export const get = (key) => {
    logger.logInfo('Retrieving value from redis for key : ' + key);
    return new Promise((resolve, reject) => {
        redis.get(key, (error, result) => {
            if (error) {
                logger.logError('Error retrieving value from Redis cache for the given key ' + key + '! ');
                logger.logError(error);
                reject(new Error('Error retrieving value from Redis cache for the given key ' + key + '! '));
            } else {
                logger.logInfo('Returning from RedisCacheService.get() with value: ' + result);
                resolve(JSON.parse(result));
            }
        });
    });
}

export const addToList = (key, values) => {
    logger.logInfo('Adding to the list: ' + key);
    logger.logInfo('Values added: ' + JSON.stringify(values));
    return new Promise((resolve, reject) => {
        redis.rpush(key, values, (error, result) => {
            if (error) {
                logger.logError(error);
                reject(new Error("Error adding to the list: " + key));
            }
            redis.expire(key, Config.REDIS_TTL, (error)=>{
                if(error){
                    logger.logError(error);
                    reject(new Error("Error setting TTL to key: " + key));
                }
                logger.logInfo('Redis cache updated successfully for key ' + key + ' ' + result);
                resolve(result);
            });
        });
    });
}

export const getList = (key, startIndex, endIndex) => {
    logger.logInfo('Executing RedisCacheService.getList()');
    logger.logInfo('Param 1- key: '+key);
    logger.logInfo('Param 2- startIndex: '+startIndex);
    logger.logInfo('Param 3- endIndex: '+endIndex);

    if(endIndex == undefined || endIndex == null){
        endIndex = -1;
    }
    
    if(startIndex == undefined || startIndex == null){
        startIndex = 0;
    }

    return new Promise((resolve, reject) => {
        redis.lrange(key, startIndex, endIndex, (error, result) => {
            if (error) {
                logger.logInfo("Error fetching list: " + key + "!");
                logger.logError(error);
                reject(new Error("Error fetching list: " + key + "!"));
            }
            redis.expire(key, Config.REDIS_TTL, (error)=>{
                if(error){
                    logger.logError(error);
                    reject(new Error("Error setting TTL to key: " + key));
                }
                logger.logInfo('Redis cache updated successfully for key ' + key + ' ' + result);
                resolve(result);
            });
        });
    });
}

export const save = (key, value) => {
    logger.logInfo('Updating redis with key : ' + key + ' value : ' + JSON.stringify(value));
    return new Promise((resolve, reject) => {
        redis.set(key, JSON.stringify(value), (error, result) => {
            if (error) {
                logger.logError('Error updating cache for key' + key);
                logger.logError(error);
                reject(new Error('Error updating cache for key' + key));
            }
            redis.expire(key, Config.REDIS_TTL, (error)=>{
                if(error){
                    logger.logError(error);
                    reject(new Error("Error setting TTL to key: " + key));
                }
                logger.logInfo('Redis cache updated successfully for key ' + key + ' ' + result);
                resolve(result);
            });
        });
    });
}