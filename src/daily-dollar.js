const emailAddress = process.env.EMAIL_ADDRESS;
const spreadsheetId = process.env.MONEY_SPREADSHEET_ID;

const google = require('googleapis');
const googleAuth = require('google-auth-library');
const helper = require('./helper.js')
const sheets = google.sheets('v4');

module.exports = {

  queryMoneySheet: function queryMoneySheet(event, context, callback) {
    const credentials = JSON.parse(event[0].body);
    const token = JSON.parse(event[1].body);
    const range = event[2].range;

    const auth = new googleAuth();
    const oauth2Client = new auth.OAuth2(
      credentials.installed.client_id,
      credentials.installed.client_secret,
      credentials.installed.redirect_uris[0]
    );
    oauth2Client.credentials = token;

    const requestObject = {
      auth: oauth2Client,
      spreadsheetId: spreadsheetId,
      range: range
    }
    sheets.spreadsheets.values.get(requestObject, (error, response) => {
      if (error) {
        throw new Error('The API returned an error: ' + error);
      }
      callback(null, {data: JSON.stringify(response)});
    });
  },

  extractBudget: function extractBudget(event, context, callback) {
    const data = JSON.parse(event.data);
    const rows = data.values.filter(row => row[4] !== 'FALSE');

    if (rows.length !== 1) {
      throw new Error(`Could not find budget (rows.length was ${rows.length})`);
    }

    const row = rows[0];
    callback(null, {
      "balance": row[2],
      "money_per_day": row[7],
      "money_per_week": row[8]
    });
  },

  emailBudget: function emailBudget(event, context, callback) {
    const subject = `Daily Dollar: ${event.money_per_day} available today.`;
    const body = `You have ${event.balance} in the bank&mdash;that&rsquo;s equal to ${event.money_per_week} weekly, or ${event.money_per_day} daily.`;

    helper.sendMail(emailAddress, subject, body).then((result) => {
      callback(null, {});
    }).catch((error) => {
      callback(error);
    });
  }
}
