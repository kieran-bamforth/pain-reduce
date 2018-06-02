const helper = require('./helper.js');
const request = require('request-promise');

module.exports = {
  binAlert: function binAlert(event, context, callback) {
    request({
      method: 'GET',
      url: 'https://www.oldham.gov.uk/bin-collection-days',
      qs: {
        postcode: process.env.POST_CODE,
        uprn: process.env.PROPERTY_REF_NO,
      },
    }).then((result) => {
      const emailAddress = process.env.EMAIL_ADDRESS;
      const emailSubject = 'Pain Reduce: Bin Alert';
      const emailBody = helper.extractBinTimetable(result);
      return helper.sendMail(emailAddress, emailSubject, emailBody);
    }).then(() => {
      callback();
    }).catch((error) => {
      callback(error);
    });
  },
};
