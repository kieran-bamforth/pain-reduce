const aws = require('aws-sdk');
const bluebird = require('bluebird');
const deep = require('deep-diff');
const handlebars = require('./handlebars');
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
      console.log(`Successfully downloaded two objects from S3. Attempting to send email to ${emailAddress}...`);

      const from = data[0].Body.toString('utf-8');
      const to = data[1].Body.toString('utf-8');

      let diff = deep.diff(JSON.parse(from), JSON.parse(to));

      if (typeof diff !== 'undefined') {
        console.log('There were no diffs to display');
        callback();
      }

      if (typeof diff !== 'undefined') {
        diff = helper.mergeDiffsWithToObject(
          deep.diff(JSON.parse(from), JSON.parse(to)),
          to
        );
        message = handlebars.diffTemplate(diff);
      }

      console.log(`${from}, ${to}`);

      return ses.sendEmail({
        Destination: {
          ToAddresses: [emailAddress],
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: message,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: `Pain Reduce: Diff Alert (${key})`,
          },
        },
        Source: emailAddress,
      }).promise();
    }).then((data) => {
      console.log(`Email sent. Message ID: ${data.MessageId}`);
      callback();
    })
      .catch((error) => {
        throw error;
      });
  },
};
