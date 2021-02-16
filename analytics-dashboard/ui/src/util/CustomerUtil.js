import * as Constants from "../config/Constants";
import underscore from 'underscore';

export function extractCustomersFromCustomerDetails(customerDetails) {
//    console.log("Executing CustomerUtil.extractCustomersFromCustomerDetails( " + JSON.stringify(customerDetails) + " ): Fetching the active set of customers");

    let customerList = [];
    if (customerDetails.isChannel) {
//        console.log("Customer is channel");
        let customer = {
            id: null,
            name: null,
            type: null
        };
        customer.id = customerDetails.cobrandId.toString();// converting to string since si-ysl api sends the cobrandId in number format
        customer.name = customerDetails.name;
        customer.type = Constants.CUSTOMER_TYPE_CHANNEL;
//        console.log("Pushing customer to list: " + JSON.stringify(customer));
        customerList.push(customer);

        if (!underscore.isEqual(null, customerDetails.subbrands)) {
            for (let subbrand of customerDetails.subbrands) {
                let customer = {
                    id: null,
                    name: null,
                    type: null
                };
                customer.id = subbrand.cobrandId.toString();
                customer.name = subbrand.name;
                customer.type = Constants.CUSTOMER_TYPE_SUBBRAND;
                customerList.push(customer);
            }
        }
    } else {
        let customer = {
            id: null,
            name: null,
            type: null
        };
        if (customerDetails.channelId === undefined || null === customerDetails.channelId) {
            customer.id = customerDetails.cobrandId.toString();
            customer.name = customerDetails.name;
            customer.type = Constants.CUSTOMER_TYPE_COBRAND;
        } else {
            customer.id = customerDetails.cobrandId.toString();
            customer.name = customerDetails.name;
            customer.type = Constants.CUSTOMER_TYPE_SUBBRAND;
        }
        customerList.push(customer);
    }

//    console.log("Returning from CustomerUtil.extractCustomersFromCustomerDetails( ) with value: " + JSON.stringify(customerList));

    return customerList;
}

export function getCustomerById(customerId, customerList) {
//    console.log("CustomerUtil.getCustomerById( " + customerId + ", " + JSON.stringify(customerList) + " ): Finding customer by Id from customer list.");
    let foundCustomer = null;

    for (let customer of customerList) {
        if (customer.id === customerId) {
            foundCustomer = customer;
            break;
        }
    }

//    console.log("CustomerUtil.getCustomerById( ) with value: " + JSON.stringify(foundCustomer));

    return foundCustomer;
}

export function getChannelCustomer(customerList) {
//    console.log("CustomerUtil.getChannelCustomer( " + JSON.stringify(customerList) + " ): Finding channel customer from customer list.");

    let channel = null;

    for (let customer of customerList) {
        if (customer.type === Constants.CUSTOMER_TYPE_CHANNEL) {
            channel = customer;
            break;
        }
    }

//    console.log("CustomerUtil.getChannelCustomer( ) with value: " + JSON.stringify(channel));

    return channel;
}