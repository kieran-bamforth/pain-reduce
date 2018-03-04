const aws = require('aws-sdk');
const bluebird = require('bluebird');

aws.config.setPromisesDependency(bluebird);

module.exports = {
  getObject: function getObject(event, context, callback) {
    let s3 = new aws.S3()
    let params = {
      Key: event.key,
      Bucket: event.bucket
    }

    let getObjectPromise = s3.getObject(params).promise();

    getObjectPromise.then((data) => {
      callback(null, {body: data.Body.toString('utf-8')});
    }).catch((error) => {
      callback(error);
    });
  }
}
