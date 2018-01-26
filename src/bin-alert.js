const aws = require('aws-sdk');
const bluebird = require('bluebird');
const request = require('request-promise');

aws.config.setPromisesDependency(bluebird);

const ses = new aws.SES();

module.exports = {
  binAlert: function binAlert(event, context, callback) {
    const propertyRefNo = process.env.PROPERTY_REF_NO;
    const emailAddress = process.env.EMAIL_ADDRESS;

    const options = {
      method: 'POST',
      url: 'https://www.oldham.gov.uk/site/custom_scripts/bin_collection_postcode_search_functions.php',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      body: `getPremiseDetailsByUniquePropertyReferenceNumber=true&propertyRefNo=${propertyRefNo}`
    };

    request(options).then((result) => {
      return ses.sendEmail({
        Destination: {
          ToAddresses: [emailAddress],
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: result,
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
