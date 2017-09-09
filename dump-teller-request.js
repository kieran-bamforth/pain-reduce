let request = require('request');
let AWS = require('aws-sdk');
let s3 = new AWS.S3();

let account = process.env.ACCOUNT;
let auth = process.env.AUTH;
let bucket = process.env.BUCKET;
let key = process.env.KEY;
let resource = process.env.RESOURCE

let options = {
  method: 'GET',
  url: `https://api.teller.io/accounts/${account}${resource}`,
  headers: {
    authorization: auth
  }
};

request(options, (error, response, body) => {
  if (error) {
    throw new Error(error);
  }

  s3.putObject({
    Body: body,
    Bucket: bucket,
    Key: `${key}/${account}${resource}/` + new Date().toISOString() + ".json"
  }, (error, data) => {
    if (error) {
      throw new Error(error);
    }
  });
});
