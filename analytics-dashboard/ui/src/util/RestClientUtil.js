import axios from 'axios';
import * as Config from '../config/Config';

export function dispatchRequestForReport(payload) {
    //    console.log("Executing RestClientUtil.dispatchRequestForReportOfSpecificCustomer(" + JSON.stringify(payload) + "): Dispatching request for getting report data");
    return axios.post(Config.FETCH_REPORT_END_POINT, payload);
}

export function dispatchRequestForEmail(payload) {
    //    console.log("Executing RestClientUtil.dispatchRequestForEmail(" + JSON.stringify(payload) + "): Dispatching request for sending feedback email");
    return axios.post(Config.EMAIL_END_POINT, payload);
}

export function dispatchRequestForCustomerDetails(payload) {
    //    console.log("Executing RestClientUtil.dispatchRequestForCustomerDetails(" + JSON.stringify(payload) + "): Dispatching request for customer details");
    return axios.post(Config.CUSTOMER_DETAILS_END_POINT, payload);
}

export function dispatchRequestToExtendSession(payload) {
    //    console.log("Executing RestClientUtil.dispatchRequestToExtendSession(" + JSON.stringify(payload) + "): Dispatching request for extending session");
    return axios.post(Config.EXTEND_USER_SESSION_END_POINT, payload);
}

export function dispatchRequestForAmplitudeStatus(payload) {
    //    console.log("Executing RestClientUtil.dispatchRequestForSearchingUser(" + JSON.stringify(payload) + "): Dispatching request to check if users exist");
    return axios.post(Config.AMPLITUDE_STATUS_END_POINT, payload);
}

export function dispatchRequestToCheckIfFeedbackButtonIsEnabled(payload) {
    //    console.log("Executing RestClientUtil.dispatchRequestToCheckIfFeedbackButtonIsEnabled(" + JSON.stringify(payload) + "): Dispatching request to check if feedback button is enabled");
    return axios.post(Config.SHOW_FEEDBACK_BUTTON_END_POINT, payload);
}

export function dispatchRequestToRegisterEvent(payload) {
    //    console.log("Executing RestClientUtil.dispatchRequestToRegisterEvent(" + JSON.stringify(payload) + "): Dispatching request to store user events in DB");
    return axios.post(Config.REGISTER_EVENT_END_POINT, payload);
}