let request = require('request');
let aws = require('aws-sdk');
let s3 = new aws.S3();

module.exports = {
  getKeyPath: function getKeyPath(key) {
    if (typeof key !== 'string') {
      throw 'expected key to be a string, but got ${typeof key}';
    }
    if (key === '') {
      throw 'expected key to not be a blank string';
    }
    return key.split('/').slice(0, -1).join('/');
  },
  getKeyName: function getKeyName(key) {
    if (typeof key !== 'string') {
      throw 'expected key to be a string, but got ${typeof key}';
    }
    if (key === '') {
      throw 'expected key to not be a blank string';
    }
    return key.split('/').slice(-1).join();
  },
  getObjectModifiedBefore: function getObjectModifiedBefore(date, objects) {
    let result = objects.reduce((acc, current) => {
      return (current.LastModified < date && current > acc.LastModified) ? current : acc;
    }, { LastModified: ''});
    if (result.LastModified === '') {
      throw new Error(`could not find any objects modified before ${date}`);
    }
    return result;
  }
}
