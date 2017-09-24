const fs = require('fs');
const hbs = require('handlebars');
const helper = require('./helper.js');
const path = require('path');

hbs.registerHelper('filterDiffsByKey', (data, context) => {
  return helper.filterDiffsByKind(data, context.hash.key)
    .map(item => context.fn(item));
});

hbs.registerHelper('join', data => data.join('.'));

const compiledTemplateDiff = hbs.compile(
  fs.readFileSync(path.join(__dirname,'templates/diff-alert.html'), 'utf-8')
);

module.exports = {
  hbs: hbs,
  diffTemplate: function diffTemplate(data) {
    return compiledTemplateDiff(data);
  },
};
