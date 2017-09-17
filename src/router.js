const aws = require('aws-sdk');
const bluebird = require('bluebird');
const deep = require('deep-diff');
const helper = require('./helper.js');

aws.config.setPromisesDependency(bluebird);

const s3 = new aws.S3();
const ses = new aws.SES();

module.exports = {
  diffAlert: function diffAlert(event, context, callback) {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const emailAddress = process.env.EMAIL_ADDRESS;

    Promise.all([
      s3.headObject({ Bucket: bucket, Key: key }).promise(),
      s3.listObjectsV2({ Bucket: bucket, Prefix: helper.getKeyPath(key) }).promise(),
    ]).then((data) => {
      const lastModified = helper.getObjectModifiedBefore(data[0].LastModified, data[1].Contents);

      console.log(`current key: ${key} last key: ${lastModified.Key}.`);

      return Promise.all([
        lastModified.Key,
        key,
      ].map(keyValue => s3.getObject({ Bucket: bucket, Key: keyValue }).promise()));
    }).then((data) => {
      console.log('Successfully downloaded two objects from S3.');

      const diff = deep.diff(
        JSON.parse(data[0].Body),
        JSON.parse(data[1].Body)
      );

      return ses.sendEmail({
        Destination: {
          ToAddresses: [emailAddress]
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: 'This is a test email.'
            },
            Text: {
              Charset: 'UTF-8',
              Data: 'This is a test email.'
            }
          },
          Subject: {
            Charset: 'UTF-8',
            Message: 'Pain Reduce: Diff Alert'
          },
        },
        Source: emailAddress
      });
    }).then((data) => {
      console.log(`Email sent. Message ID: ${data.MessageId}`);
      callback();
    })
      .catch((error) => {
        throw error;
      });
  },
};
