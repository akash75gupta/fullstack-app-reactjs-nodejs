import * as RestClientUtil from '../util/RestClientUtil';
import * as CustomerUtil from '../util/CustomerUtil';

export function fetchCustomerDetails(requestParams) {
   // console.log("Executing CustomerAgent.fetchCustomerDetails()");
   // console.log("Param 1: requestParams= "+JSON.stringify(requestParams));

    let requestPayload = {
        userInfo:{
            cobrandId: requestParams.cobrandId,
            sessionId: requestParams.sessionId,
            appId: requestParams.appId
        }
    }

    return new Promise((resolve, reject) => {
        RestClientUtil.dispatchRequestForCustomerDetails(requestPayload).then((success) => {
        //    console.log("Returning from CustomerAgent.fetchCustomerDetails()- value: " + JSON.stringify(success));
            resolve(success.data.cobrandInfo);
        }).catch((error) => {
            console.error("Returning from fetchCustomerDetails.fetchCustomerDetails()- value: " + JSON.stringify(error));
            reject(error);
        });
    });
}

export function fetchSubscribedCustomers(customerDetails, requestParams) {
  //  console.log("Executing CustomerAgent.fetchSubscribedCustomers() with-");
  //  console.log("Param 1: cutomerDetails= "+JSON.stringify(customerDetails)); 
  //  console.log("Param 2: requestParams= "+JSON.stringify(requestParams));

    return new Promise((resolve, reject) => {
        let subscribedCustomersList = [];
        let customersMasterList = CustomerUtil.extractCustomersFromCustomerDetails(customerDetails);
      //  console.log("Total number of customers: " + customersMasterList.length);

        if(null === customersMasterList.length || customersMasterList.length < 1){
            let error = new Error("Master list of customer is blank or null. No customer exists.");
           console.error("Error fetching subscription details");
           console.error(JSON.stringify(error));
        //    console.log("Returning from CustomerAgent.fetchSubscribedCustomers()");
            reject(error);
        }else if (customersMasterList.length === 1) {
            subscribedCustomersList.push(customersMasterList[0]);
        //    console.log("Returning from CustomerAgent.fetchSubscribedCustomers() with value: " + JSON.stringify(subscribedCustomersList));
            resolve(subscribedCustomersList);
        } else {
            let promises = [];
            for (let i = 0; i < customersMasterList.length; i++) {
                let requestPayload = {
                    customerId:customersMasterList[i].id,
                    strictMode:true,
                    userInfo:{
                        cobrandId:requestParams.cobrandId,
                        sessionId:requestParams.sessionId,
                        appId:requestParams.appId
                    }
               
                }
                promises[i] = new Promise((resolve, reject) => {
                    RestClientUtil.dispatchRequestForAmplitudeStatus(requestPayload).then((responsePayload) => {
            //            console.log(i+".) Does users exist for customerId- "+customersMasterList[i].id+"? "+responsePayload.data.enableAmplitude);
                        if(responsePayload.data.amplitudeEnabled) {
                            subscribedCustomersList.push(customersMasterList[i]);
                        }
                        resolve(subscribedCustomersList);
                    }).catch((error) => {
                        console.error("Error fetching subscription information for customer: "+customersMasterList[i].id);
                        reject(error);
                    });
                });
            }
      
            Promise.all(promises).then(() => {
            //    console.log("All the promises are resolved. The final response is: "+JSON.stringify(successResponses));
            //    console.log("Returning from CustomerAgent.fetchSubscribedCustomers() with value- "+JSON.stringify(subscribedCustomersList));
                resolve(subscribedCustomersList);
            }).catch((errorResponses) => {
                console.error("###Error: All the promises are rejected. The final response is: "+JSON.stringify(errorResponses));
                console.error(JSON.stringify(errorResponses[0]));
                console.error("Returning from CustomerAgent.fetchSubscribedCustomers()");
                reject(errorResponses[0]);
            });   
        }
    });
}

export function showFeedbackButton(requestParams) {
   // console.log("Executing CustomerAgent.showFeedbackButton() with-");
   // console.log("Param 1: requestParams= "+JSON.stringify(requestParams)); 
    return new Promise((resolve, reject) => {
        let requestPayload = {
            userInfo: {
                cobrandId: requestParams.cobrandId,
                sessionId: requestParams.sessionId,
                appId: requestParams.appId
            }
        };

        RestClientUtil.dispatchRequestToCheckIfFeedbackButtonIsEnabled(requestPayload).then((responsePayload) => {
            let isFeedbackButtonEnabled = responsePayload.data.feedbackButtonEnabled;
        //    console.log("Returning from CustomerAgent.showFeedbackButton() with value= "+isFeedbackButtonEnabled);
            resolve(isFeedbackButtonEnabled);
        }).catch((error)=>{
            console.error("###Error checking if feedback button is enabled: ", error.message);
            reject(error);
        });
    });

}
