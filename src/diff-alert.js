const aws = require('aws-sdk');
const bluebird = require('bluebird');
const deep = require('deep-diff');
const handlebars = require('./handlebars');
const helper = require('./helper.js');

aws.config.setPromisesDependency(bluebird);

const s3 = new aws.S3();

module.exports = {
  diffAlert: function diffAlert(event, context, callback) {
    const bucket = event.Records[0].s3.bucket.name;
    const newObjectKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    Promise.all([
      helper.getObject(bucket, newObjectKey),
      s3.listObjectsV2({ Bucket: bucket, Prefix: helper.getKeyPath(newObjectKey) }).promise(),
    ]).then((data) => {
      // Find the last S3 object; created before new object.
      const newObject = data[0];
      const objectList = data[1];

      const lastModifiedObject = helper.getObjectModifiedBefore(
        newObject.LastModified,
        objectList.Contents,
      );
      console.log(`Retreiving nearest object: ${lastModifiedObject.Key}`);

      return Promise.all([
        newObject,
        helper.getObject(bucket, lastModifiedObject.Key),
      ]);
    }).then((data) => {
      // If different, email diff of last object..new object.
      const fromBody = data[0].Body.toString('utf-8');
      const toBody = data[1].Body.toString('utf-8');
      const diff = deep.diff(JSON.parse(fromBody), JSON.parse(toBody));

      if (typeof diff === 'undefined') {
        console.log('There were no diffs to display.');
        callback();
        return;
      }

      const emailBody = handlebars.diffTemplate(helper.mergeDiffsWithToObject(diff, toBody));
      const emailSubject = 'Pain Reduce: Diff Alert';
      const emailAddress = process.env.EMAIL_ADDRESS;
      return helper.sendMail(emailAddress, emailSubject, emailBody);
    }).then(() => {
      callback();
    }).catch((error) => {
      callback(error);
    });
  },
};
