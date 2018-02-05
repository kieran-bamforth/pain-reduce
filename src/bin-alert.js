const aws = require('aws-sdk');
const bluebird = require('bluebird');
const request = require('request-promise');

aws.config.setPromisesDependency(bluebird);

const ses = new aws.SES();

module.exports = {
  binAlert: function binAlert(event, context, callback) {
    const postCode=  process.env.POST_CODE;
    const propertyRefNo = process.env.PROPERTY_REF_NO;
    const options = {
      method: 'GET',
      url: `https://www.oldham.gov.uk/bin-collection-days?postcode=${postCode}&uprn=${propertyRefNo}`,
    };

    request(options).then((result) => {
      const helper = require('./helper.js')
      const emailAddress = process.env.EMAIL_ADDRESS;

      timetable = helper.extractBinTimetable(result);
      parsedTimetable = helper.parseBinTimetable(timetable);

      return ses.sendEmail({
        Destination: {
          ToAddresses: [emailAddress],
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: timetable
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'Pain Reduce: Bin Alert',
          },
        },
        Source: emailAddress,
      }).promise();
    }).then((data) => {
      console.log(`Email sent. Message ID: ${data.MessageId}`);
      callback();
    })
      .catch((error) => {
        callback(error)
      });
  },
}
