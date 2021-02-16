//REPORT CONFIGURATIONS
export const REPORTS = [
    "MYAPP_LOGIN_SUCCESS",
    "MYAPP_USER_SESSION_LENGTH_DISTRIBUTION",
    "MYAPP_MFA_SUCCESS_BY_TYPE",
    "MYAPP_CAPTURED_SEARCH_TEXT"
];

export const REPORT_METADATA = {
    "MYAPP_USER_SESSION_LENGTH_DISTRIBUTION": {
        "type": "SESSION",
        "title": "User Session Length Distribution",
        "subtitle": "SESSION LENGTH",
        "frequency": "Daily",
        "timePeriod": "Last 30 Days",
        "description": "This report shows the distribution of user session lengths in a histogram. Session length is the amount of time a user spends in the MyApp application in a single session. This a good way to measure engagement.",
        "query": {
            "urlParams": {
                "start": "",
                "end": "",
                "segments": [
                    {
                        "prop": "gp:BRAND_ID",
                        "op": "is",
                        "values": []
                    },
                    {
                        "prop": "gp:MYAPP_TYPE",
                        "op": "is",
                        "values": ["BASIC_AGGREGATION"]
                    }
                ]
            }
        }
    },
    "MYAPP_LOGIN_SUCCESS": {
        "type": "FUNNEL",
        "title": "Login Success",
        "subtitle": "FUNNEL CONVERSION",
        "frequency": "Daily",
        "description": "This report displays the number of users who perform a series of events throughout the account addition process. Each step measures the number of users who launch MyApp, reach the login screen, enter their credentials, and successfully login. This provides insight as to how and why users are dropping off through the authentication process.",
        "timePeriod": "Last 30 Days",
        "query": {
            "urlParams": {
                "events": [
                    {
                        "event_type": "FL_APP_LAUNCH"
                    }, {
                        "event_type": "MYAPP_VERIFYCREDS_DURATION"
                    }, {
                        "event_type": "MYAPP_VERIFYCREDS_BUTTON_SUBMIT"
                    }, {
                        "event_type": "MYAPP_VERIFYCREDS_BACKGROUND_LOGIN-SUCCESS"
                    }
                ],
                "segments": [
                    {
                        "prop": "gp:BRAND_ID",
                        "op": "is",
                        "values": []
                    },
                    {
                        "prop": "gp:MYAPP_TYPE",
                        "op": "is",
                        "values": ["BASIC_AGGREGATION"]
                    }
                ]
            }
        }
    },
    "MYAPP_MFA_SUCCESS_BY_TYPE": {
        "type": "FUNNEL",
        "title": "MFA Success by Type",
        "subtitle": "TOTALS",
        "frequency": "Daily",
        "timePeriod": "Last 30 Days",
        "description": "This report shows the success rate of each multi-factor authentication (MFA) method. This is a common point where users get stuck through the account addition flow. For each MFA there are two bars- the first shows the number of users that were shown the MFA and the second is the number of users that entered the MFA successfully. This data gives insight into which security type is most effective and easiest for users to authenticate.",
        "query": {
            "urlParams": {
                "start": "",
                "end": ""
            }
        }
    },
    "MYAPP_MFA_SUCCESS_BY_TYPE_NO_MFA": {
        "type": "FUNNEL",
        "title": "MFA Success by Type",
        "subtitle": "TOTALS",
        "frequency": "Daily",
        "timePeriod": "Last 30 Days",
        "description": "This report shows the success rate of each multi-factor authentication (MFA) method. This is a common point where users get stuck through the account addition flow. For each MFA there are two bars- the first shows the number of users that were shown the MFA and the second is the number of users that entered the MFA successfully. This data gives insight into which security type is most effective and easiest for users to authenticate.",
        "query": {
            "urlParams": {
                "start": "",
                "end": ""
            }
        }
    },
    "MYAPP_MFA_SUCCESS_BY_TYPE_SECURITY_QUESTION": {
        "type": "FUNNEL",
        "title": "MFA Success by Type",
        "subtitle": "TOTALS",
        "frequency": "Daily",
        "timePeriod": "Last 30 Days",
        "description": "This report shows the success rate of each multi-factor authentication (MFA) method. This is a common point where users get stuck through the account addition flow. For each MFA there are two bars- the first shows the number of users that were shown the MFA and the second is the number of users that entered the MFA successfully. This data gives insight into which security type is most effective and easiest for users to authenticate.",
        "query": {
            "urlParams": {
                "start": "",
                "end": ""
            }
        }
    },
    "MYAPP_MFA_SUCCESS_BY_TYPE_TOKEN": {
        "type": "FUNNEL",
        "title": "MFA Success by Type",
        "subtitle": "TOTALS",
        "frequency": "Daily",
        "timePeriod": "Last 30 Days",
        "description": "This report shows the success rate of each multi-factor authentication (MFA) method. This is a common point where users get stuck through the account addition flow. For each MFA there are two bars- the first shows the number of users that were shown the MFA and the second is the number of users that entered the MFA successfully. This data gives insight into which security type is most effective and easiest for users to authenticate.",
        "query": {
            "urlParams": {
                "start": "",
                "end": ""
            }
        }
    },
    "MYAPP_MFA_SUCCESS_BY_TYPE_IMAGE": {
        "type": "FUNNEL",
        "title": "MFA Success by Type",
        "subtitle": "TOTALS",
        "frequency": "Daily",
        "timePeriod": "Last 30 Days",
        "description": "This report shows the success rate of each multi-factor authentication (MFA) method. This is a common point where users get stuck through the account addition flow. For each MFA there are two bars- the first shows the number of users that were shown the MFA and the second is the number of users that entered the MFA successfully. This data gives insight into which security type is most effective and easiest for users to authenticate.",
        "query": {
            "urlParams": {
                "start": "",
                "end": ""
            }
        }
    },
    "MYAPP_CAPTURED_SEARCH_TEXT": {
        "type": "SEGMENT",
        "title": "Captured Search Text",
        "subtitle": "TOTALS",
        "frequency": "Daily",
        "description": "This event segmentation report shows the top six financial institutions that users are searching for by typing into the search bar. This is providing insight into what institutions users are searching for and where else they have financial accounts. If there is a financial institution that is searched frequently, you may want to consider adding it as a button on the popular sites selection screen for a better user experience.",
        "timePeriod": "Last 30 Days",
        "query": {
            "urlParams": {
                "events": [
                    {
                        "event_type": "MYAPP_SELECTSITE_LINK_SELECT-SITE",
                        "group_by": [{ "type": "event", "group_type": "User", "value": "SEARCH_STRING" }]
                    }
                ],
                "segments": [
                    {
                        "prop": "gp:BRAND_ID",
                        "op": "is",
                        "values": []
                    },
                    {
                        "prop": "gp:MYAPP_TYPE",
                        "op": "is",
                        "values": ["BASIC_AGGREGATION"]
                    }
                ],
                "metric": "totals",
                "interval": 1
            }
        }
    }
};

//CRON JOB SETTING
export const CRON_MASTER_JOB_TOTAL_DURATION = 10; //total job time in days for master
export const CRON_WORKER_GET_REPORT_JOB_LAP_THROUGHPUT = 2; //per hour restriction of Amplitude
export const CRON_WORKER_GET_REPORT_JOB_LAP_DURATION = 5; //job lap time in hours for worker

//API CONFIGURATIONS
export const WORKER_STATUS_CALLBACK_END_POINT = "/api/cron/master/workerStatus";
export const WORKER_START_END_POINT = "/api/cron/worker/start";
export const AMPLITUDE_SEGMENT_END_POINT="/events/segmentation";
export const AMPLITUDE_FUNNEL_END_POINT="/funnels";
export const AMPLITUDE_USER_END_POINT="/usersearch";
export const AMPLITUDE_SESSION_END_POINT="/sessions/length";
export const API_RESPONSE_TIMEOUT = 60000; //in ms

//REDIS CONFIGURATIONS
export const REDIS_TTL = 1000 * 60 * 60  * 24 * 14; //in ms
export const REDIS_DB = 2;

//DC CONFIGURATIONS
export const WORKERS = [
    {
        "dataCenter":"SC9",
        "url":"http://localhost:3020"
    },
    {
        "dataCenter":"CA",
        "url":"http://localhost:3021"
    }
];

//HACK TO RESTRICT CUSTOMERS FOR FIRST RELEASE
export const TARGET_CUSTOMER_POOL = [
    "10018556",
    "39710018556",
    "30610018556",
    "20510018556",
    "36610018556",
    "42410018556",
    "45210018556",
    "36210018556",
    "20410018556",        
    "10005960",
    "28310005960",
    "3210005960",
    "5310005960",
    "28210005960",
    "10005220",
    "23010005220",
    "22810005220",
    "10005652",
    "27610005652"
];