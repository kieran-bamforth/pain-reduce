const aws = require('aws-sdk');
const bluebird = require('bluebird');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const helper = require('./helper.js');

aws.config.setPromisesDependency(bluebird);

function querySheet(sheets, oauth2Client, spreadSheetId, range) {
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get({
      auth: oauth2Client,
      spreadsheetId: spreadSheetId,
      range: range,
    }, (error, response) => {
      if (error) {
        reject(error);
      }
      resolve(response);
    });
  });
}

function extractBudget(data) {
  const rows = data.values.filter(row => row[4] !== 'FALSE');

  if (rows.length !== 1) {
    throw new Error(`Could not find budget (rows.length was ${rows.length})`);
  }

  const row = rows[0];
  return {
    balance: row[2],
    money_per_day: row[7],
    money_per_week: row[8],
  };
}

function emailBudget(budget) {
  const moneyPerDay = budget.money_per_day;
  const moneyPerDayFloat = Number.parseFloat(moneyPerDay.substr(1, moneyPerDay.length));
  const monzoLink = `https://monzo.me/kieranbamforth/${moneyPerDayFloat}`;
  return helper.sendMail(
    process.env.EMAIL_ADDRESS,
    `Daily Dollar: ${budget.money_per_day} available today.`,
    `You have ${budget.balance} in the bank&mdash;that&rsquo;s equal to ${budget.money_per_week} weekly, or <a href="${monzoLink}">${budget.money_per_day}</href> daily.`
  );
}

module.exports = {
  dailyDollar: function dailyDollar(event, context, callback) {
    const s3 = new aws.S3();

    const googleApiAuthObjects = ['client-secret.json', 'token.json'].map(objectName =>
      s3.getObject({
        Key: `daily-dollar/${objectName}`,
        Bucket: process.env.BUCKET
      }).promise());

    Promise.all(googleApiAuthObjects).then((data) => {
      const clientSecret = JSON.parse(data[0].Body.toString('utf-8'));
      const token = JSON.parse(data[1].Body.toString('utf-8'));

      const auth = new googleAuth();
      const oauth2Client = new auth.OAuth2(
        clientSecret.installed.client_id,
        clientSecret.installed.client_secret,
        clientSecret.installed.redirect_uris[0]
      );
      oauth2Client.credentials = token;

      const sheets = google.sheets('v4');
      return querySheet(
        sheets,
        oauth2Client,
        process.env.MONEY_SPREADSHEET_ID,
        'Budget!A2:I1000'
      );
    }).then(data => emailBudget(extractBudget(data))).then(() => {
      callback(null, {});
    })
      .catch((error) => {
        callback(error);
      });
  },
};
