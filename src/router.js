const aws = require('aws-sdk');
const bluebird = require('bluebird');
const helper = require('./helper.js');

aws.config.setPromisesDependency(bluebird);

const s3 = new aws.S3();

module.exports = {
  diffAlert: function diffAlert(event, context, callback) {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    Promise.all([
      s3.headObject({ Bucket: bucket, Key: key }).promise(),
      s3.listObjectsV2({ Bucket: bucket, Prefix: helper.getKeyPath(key) }).promise(),
    ]).then((data) => {
      let lastModified = helper.getObjectModifiedBefore(data[0].LastModified, data[1].Contents);
      return Promise.all([
        key,
        lastModified.Key
      ].map(keyValue => s3.getObject({ Bucket: bucket, Key: keyValue }).promise()));
    }).then((data) => {
      callback();
    }).catch((error) => {
      console.log(error);
      throw error;
    });
  },
}
