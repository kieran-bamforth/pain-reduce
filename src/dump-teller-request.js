let request = require('request');
let aws = require('aws-sdk');
let s3 = new aws.S3();

function dumpTellerRequest(auth, bucket, keyPrefix) {
  return function(opts) {
    let url = `https://api.teller.io/accounts/${opts.account}${opts.resource}`;
    let key = `${keyPrefix}/${opts.account}${opts.resource}/` + new Date().toISOString() + ".json"

    let options = {
      method: 'GET',
      url: url,
      headers: { authorization: auth }
    };

    request(options, (error, response, body) => {
      if (error) throw new Error(error);

      s3.putObject({ Body: body, Bucket: bucket, Key: key }, (error, data) => {
        if (error) throw new Error(error);
      });
    });
  }
}

[
  {account: "55d6ff1e-f636-42a3-a58f-c6f24644f326", resource: "/standing_orders" },
  {account: "55d6ff1e-f636-42a3-a58f-c6f24644f326", resource: "/direct_debits" },
  {account: "f7d31ed8-c8a3-41e4-8855-2668161921ac", resource: "/standing_orders" },
  {account: "f7d31ed8-c8a3-41e4-8855-2668161921ac", resource: "/direct_debits" },
  {account: "78eabbb2-de1c-45a2-b586-384b063ae9dd", resource: "/standing_orders" },
  {account: "78eabbb2-de1c-45a2-b586-384b063ae9dd", resource: "/direct_debits" }
].forEach(dumpTellerRequest(process.env.AUTH, process.env.BUCKET, process.env.KEY_PREFIX));
