import Axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';
import * as CustomerAgent from './agent/CustomerAgent';
import Dashboard from './components/Dashboard';
import Error from './components/Error';
import Loader from './components/Loader';

import './index.css';
import 'antd/dist/antd.css';

//initializing app at loading time

Axios.interceptors.response.use((response) => {
  window.dispatchEvent(new Event("resetTimer"));
  return response;
});

ReactDOM.render(
  <Loader />,
  document.getElementById('root')
);

(function () {
 //console.log("Loading Analytics App");
  try {
    let requestParams = {
      cobrandId: null,
      cobrandName: null,
      sessionId: null,
      appId: null,
      returnUrl: null,
      subscribedCustomersList: null
    };

    let queryParamString = window.location.hash.split("returnUrl=")[1];
   //console.log("Query Param String: " + queryParamString);

    let queryParams = queryParamString.split("#");

    let returnUrl = queryParams[0];
   //console.log("Return URL: " + returnUrl);

    let cobrandIdParam = queryParams[1];
    let cobrandId = cobrandIdParam.split("cobrandId=")[1];
   //console.log("Cobrand ID:" + cobrandId);

    let sessionIdParam = queryParams[2];
    let sessionId = sessionIdParam.split("sessionId=")[1];
   //console.log("Session ID:" + sessionId);

    let appIdParam = queryParams[3];
    let appId = appIdParam.split("appId=")[1];
   //console.log("App ID:" + appId);

    requestParams.cobrandId = cobrandId;
    requestParams.sessionId = sessionId;
    requestParams.appId = appId;
    requestParams.returnUrl = returnUrl;

    CustomerAgent.fetchCustomerDetails(requestParams)
      .then((customerDetails) => {
        requestParams.cobrandName = customerDetails.name;
        CustomerAgent.fetchSubscribedCustomers(customerDetails, requestParams)
          .then((subscribedCustomersList) => {
          //console.log("Subscribed customers found: " + JSON.stringify(subscribedCustomersList));
            requestParams.subscribedCustomersList = subscribedCustomersList;//setting the list of active customers
            CustomerAgent.showFeedbackButton(requestParams).then((showFeedbackButton)=>{
              requestParams.showFeedbackButton = showFeedbackButton;
              const router = (
                <Router>
                  <div>
                    <Route exact path="/" render={props => <Dashboard requestParams={requestParams} {...props} />} />
                  </div>
                </Router>
              );
              ReactDOM.render(
                router,
                document.getElementById('root')
              );
            }).catch((error)=>{
              console.error("Error while checking if Feedback button is enabled: " + error);
              ReactDOM.render(
                <Error />,
                document.getElementById('root')
              );
            });
          }).catch((error) => {
            console.error("Error while fetching for subscribed customers: " + error);
            ReactDOM.render(
              <Error />,
              document.getElementById('root')
            );
          });
      }).catch((error) => {
        console.error("Error fetching customer details: " + error);
        ReactDOM.render(
          <Error />,
          document.getElementById('root')
        );
      });
  } catch (error) {
    console.error("Global Error: " + error);
    ReactDOM.render(
      <Error />,
      document.getElementById('root')
    );
  }
})();