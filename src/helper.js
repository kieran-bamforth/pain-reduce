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
  previousDateStr(start, dates) {
    if (typeof start !== 'string') {
      throw 'expected start to be a string';
    }
    if (!Array.isArray(dates)) {
      throw 'expected dates to be a array';
    }
    return dates.reduce((acc, date) => {
      return (date < start && date > acc) ? date : acc;
    });
  }
}
