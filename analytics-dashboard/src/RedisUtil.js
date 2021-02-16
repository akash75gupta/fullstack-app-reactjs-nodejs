import * as  Constants from './Constants';

export const getServerOpts = () => {
    let redisServers = process.env.REDIS_SENTINEL_SERVER_URL.split(',');
    let redisServerFormatted = [];
    var i;
    for(i=0 ; i<redisServers.length;i++){
         redisServerFormatted.push({
            host:redisServers[i].split(':')[0],
            port:redisServers[i].split(':')[1]
        });
    }
    return {
        sentinels: redisServerFormatted,
        name: process.env.REDIS_MASTER_NAME,
        retryStrategy: function (times) {
            var delay = times * 1000;
            return delay;
        }
    }
}

export const getKey = (...params) => {
   let key = Constants.REDIS_BUCKET;

   if(params.length <= 0){
        throw Error("No argument(s) passed. Cannot generate key.");
   }

   for(let i=0; i<params.length; i++){
        key = key+"_"+params[i];
   }

   return key;
}