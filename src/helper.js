const aws = require('aws-sdk');
const bluebird = require('bluebird');
const cheerio = require('cheerio');

aws.config.setPromisesDependency(bluebird);

const s3 = new aws.S3();
const ses = new aws.SES();

module.exports = {
  getKeyPath: function getKeyPath(key) {
    if (typeof key !== 'string') {
      throw Error(`expected key to be a string, but got ${typeof key}`);
    }
    if (key === '') {
      throw Error('expected key to not be a blank string');
    }
    return key.split('/').slice(0, -1).join('/');
  },
  getKeyName: function getKeyName(key) {
    if (typeof key !== 'string') {
      throw Error(`expected key to be a string, but got ${typeof key}`);
    }
    if (key === '') {
      throw Error('expected key to not be a blank string');
    }
    return key.split('/').slice(-1).join();
  },
  getObjectModifiedBefore: function getObjectModifiedBefore(dateString, objects) {
    const defaultObject = { LastModified: '' };

    const object = objects.reduce((nearestObject, currentObject) => {
      const nearestDate = nearestObject.LastModified;
      const currentDate = currentObject.LastModified;

      if ((nearestDate < currentDate) && (currentDate < dateString)) {
        return currentObject;
      }

      return nearestObject;
    }, defaultObject);

    if (object === defaultObject) {
      throw new Error(`could not find any objects modified before ${dateString}`);
    }

    return object;
  },
  mergeDiffsWithToObject: function mergeDiffsWithToObject(diffs, toObject) {
    return diffs.map((currentValue) => {
      const path = currentValue.path.slice(0, -1).join('.');
      return Object.assign({}, currentValue, { to: toObject[path] });
    });
  },
  filterDiffsByKind: function filterDiffsByKind(diffs, kind) {
    return diffs.filter(element => element.kind === kind);
  },
  extractBinTimetable: function extractBinTimetable(timetableHtml) {
    const $ = cheerio.load(timetableHtml);
    return $.html($('#bin_collections'));
  },
  parseBinTimetable: function parseBinTimetable(timetableHtml) {
    const $ = cheerio.load(timetableHtml)
    const timetable = {}

    $('tbody > tr').each((i, elem) => {
      const tds = $(elem).children()
      const colour = tds.first().text().split(' ').shift()
      const date = tds.last().text()

      if (Object.keys(timetable).indexOf(date) == -1 ) {
        timetable[date] = []
      }

      timetable[date].push(colour)
    });

    nearestDate = Object.keys(timetable).reduce((currentDateStr, nextDateStr) => {
      const [currentDay, currentMonth, currentYear] = currentDateStr.split("/");
      const [nextDay, nextMonth, nextYear] = nextDateStr.split("/");

      const currentDate = new Date(currentYear, currentMonth-1, currentDay);
      const nextDate = new Date(nextYear, nextMonth-1, nextDay);

      return (currentDate < nextDate) ? currentDateStr : nextDateStr;
    })

    return {
      "next": nearestDate,
      "timetable": timetable
    }
  },
  sendMail: function sendMail(emailAddress, subject, body) {
    return ses.sendEmail({
      Destination: {
        ToAddresses: [emailAddress],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: body
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        },
      },
      Source: emailAddress,
    }).promise();
  },
  getObject: function getPainReduceObject(bucket, key) {
    return s3.getObject({ Bucket: bucket, Key: key }).promise()
  },
};
