const handlebars = require('./handlebars');
const data = [
  {
    kind: 'N',
    path: [7, 'amount'],
    rhs: '89.03',
    to: {
      reference: 'A REFERENCE',
      originator_name: 'AN ORIGINATOR',
      links: {},
      last_requested: '2017-07-13',
      id: 'AN ID',
      currency: 'GBP',
      amount: '89.02',
    },
  },
  {
    kind: 'D',
    path: [7, 'amount'],
    lhs: '89.03',
    to: {
      reference: 'A REFERENCE',
      originator_name: 'AN ORIGINATOR',
      links: {},
      last_requested: '2017-07-13',
      id: 'AN ID',
      currency: 'GBP',
      amount: '89.02',
    },
  },
  {
    kind: 'A',
    path: [7, 'amount'],
    lhs: '89.03',
    rhs: '89.02',
    to: {
      reference: 'A REFERENCE',
      originator_name: 'AN ORIGINATOR',
      links: {},
      last_requested: '2017-07-13',
      id: 'AN ID',
      currency: 'GBP',
      amount: '89.02',
    },
  },
  {
    kind: 'E',
    path: [7, 'amount'],
    lhs: '89.03',
    rhs: '89.02',
    to: {
      reference: 'A REFERENCE',
      originator_name: 'AN ORIGINATOR',
      links: {},
      last_requested: '2017-07-13',
      id: 'AN ID',
      currency: 'GBP',
      amount: '89.02',
    },
  },
];

console.log(handlebars.diffTemplate(data));
