const spreadsheetId = process.env.MONEY_SPREADSHEET_ID;

const google = require('googleapis');
const googleAuth = require('google-auth-library');
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
  }
}
