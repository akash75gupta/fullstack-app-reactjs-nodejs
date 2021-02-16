import nodemailer from 'nodemailer';
import smtpPool from 'nodemailer-smtp-pool';
import * as logger from './LoggerUtil';
import * as Constants from './Constants';
import * as RequestContext from './RequestContext';

export let sendEmail = (emailRequestDto) => {
    logger.logInfo("Executing EmailService.sendEmail(): Sending email from backend server.");
    logger.logInfo(emailRequestDto);

    return new Promise((resolve, reject)=>{
    let content = emailRequestDto["content"];
    let userInfo = emailRequestDto["userInfo"];

    let cobrandId = userInfo.cobrandId;
    let cobrandName = userInfo.cobrandName;

      let email = RequestContext.getEmail();
      let username = RequestContext.getUsername();

      logger.logInfo("EmailService.sendEmail() Username : "+username+" Email : "+email);

      let emailTransportOption = {
        host: process.env.EMAIL_SERVER_URL
      };

      let transporter = nodemailer.createTransport(smtpPool(emailTransportOption));

      const emailDispatchOptions = {
        from: Constants.FEEDBACK_EMAIL_SENDER, // sender address 
        to: Constants.FEEDBACK_EMAIL_RECIPIENTS, // list of receivers
        subject: Constants.FEEDBACK_EMAIL_SUBJECT + " " + cobrandName+" ("+cobrandId+")", // Subject line
        html: "<table style=\"border: 1px solid blue;border-collapse: collapse;\">"
          + "<tr><th style=\"border: 1px solid blue;border-collapse: collapse; background-color:#b6cff0;text-align:left;width: 250px; max-width: 250px;min-width: 50px;word-break: break-word;\">"
          + "&nbsp;Cobrand&nbsp;</th>"
          + "<td style=\"border: 1px solid blue;border-collapse: collapse;text-align:left;width: 250px; max-width: 250px;min-width: 50px;word-break: break-word;\">"
          + "&nbsp;" + cobrandName+"&nbsp;("+cobrandId+")"+ "&nbsp;</td>"
          + "<tr><th style=\"border: 1px solid blue;border-collapse: collapse;background-color:#b6cff0;text-align:left;width: 250px; max-width: 250px;min-width: 50px;word-break: break-word;\">"
          + "&nbsp;User&nbsp;</th>"
          + "<td style=\"border: 1px solid blue;border-collapse: collapse;text-align:left;width: 250px; max-width: 250px;min-width: 50px;word-break: break-word;\">"
          + "&nbsp;" +username+" - "+email + "&nbsp;</td></tr>"
          + "<tr><th style=\"border: 1px solid blue;border-collapse: collapse;background-color:#b6cff0;text-align:left;width: 250px; max-width: 250px;min-width: 50px;word-break: break-word;\">"
          + "&nbsp;Feedback&nbsp;</th>"
          + "<td style=\"border: 1px solid blue;border-collapse: collapse;text-align:left;width: 250px; max-width: 250px;min-width: 50px;word-break: break-word;\">"
          + "&nbsp;" + content + "&nbsp;</td></tr>"
      };

      // send mail with defined mailer object
      transporter.sendMail(emailDispatchOptions, (error, info) => {
        logger.logInfo("Email Dispatch attempted: " + JSON.stringify(info));
        if (error) {
            logger.logInfo("Email Dispatch failed.");
            reject(error);
        }
        logger.logInfo("Email Dispatch Successful");
        resolve("Success!");
      });
  });
}