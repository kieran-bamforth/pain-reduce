const chai = require('chai');
const dailyDollar = require('../src/daily-dollar');

suite('dailyDollar.js', () => {
  it('should extract the budget', () => {
    // const data = {
    //   range: 'Budget!A2:I1000',
    //   majorDimension: 'ROWS',
    //   values: [
    //     ['21', '15 December 2017', '£0.01', '15 January 2018', 'FALSE', 'FALSE', '', 'FALSE', 'FALSE'],
    //     ['22', '15 January 2018', '£0.00', '15 February 2018', 'FALSE', 'FALSE', '', 'FALSE', 'FALSE'],
    //     ['48', '15 February 2018', '£92.24', '15 March 2018', '12', '£0.00', '', '£7.69', '£53.81'],
    //   ],
    // };
    // chai.assert.deepEqual(
    //   dailyDollar.extractBudget(data),
    //   {
    //     balance: '£92.24',
    //     money_per_day: '£7.69',
    //     money_per_week: '£53.81',
    //   },
    // );
  });
});
