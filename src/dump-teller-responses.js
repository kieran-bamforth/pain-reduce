const request = require('request');
const aws = require('aws-sdk');

const s3 = new aws.S3();

function dumpTellerResponses(auth, bucket, keyName) {
  return function (opts) {
    const url = `https://api.teller.io/accounts/${opts.account}${opts.resource}`;
    const key = `teller-responses/${opts.account}${opts.resource}/${keyName}`;

    const options = {
      method: 'GET',
      url: url,
      headers: { authorization: auth },
    };

    request(options, (error, response, body) => {
      if (error) throw new Error(error);

      s3.putObject({ Body: body, Bucket: bucket, Key: key }, (error, data) => {
        if (error) throw new Error(error);
      });
    });
  };
}

module.exports = {
  index: function index() {
    [
      { account: 'f7d31ed8-c8a3-41e4-8855-2668161921ac', resource: '/standing_orders' },
      { account: 'f7d31ed8-c8a3-41e4-8855-2668161921ac', resource: '/direct_debits' },
      { account: '78eabbb2-de1c-45a2-b586-384b063ae9dd', resource: '/standing_orders' },
      { account: '78eabbb2-de1c-45a2-b586-384b063ae9dd', resource: '/direct_debits' }
    ].forEach(dumpTellerResponses(process.env.AUTH, process.env.BUCKET, new Date().toISOString()));
  }
}
