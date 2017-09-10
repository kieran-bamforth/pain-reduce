let mocha = require('mocha');
let assert = require('chai').assert;
let helper = require('../src/helper');

suite('helper.js', () => {
  suite('getSiblings', () => {
  });
  suite('getKeyPath', () => {
    test('get the correct key path to the current key', () => {
      assert.strictEqual(
        helper.getKeyPath('teller-responses/account/direct_debits/changed_file'),
        'teller-responses/account/direct_debits'
      )
    });
    test('return a blank key path if this is a root level item', () => {
      assert.strictEqual(helper.getKeyPath('teller-responses'), '');
    });
    test('shit the bed if the provided key is blank', () => {
      assert.throws(() => {return helper.getKeyPath('')});
    });
    test('shit the bed if the provided key is not a string', () => {
      assert.throws(() => {return helper.getKeyPath(null)});
    });
  });
  suite('previousDateStr', () => {
    test('should get the previous date string', () => {
      let allDateStrs = [
        '2017-09-09T16:05:17.338Z',
        '2017-09-19T16:05:17.338Z',
        '2017-09-29T16:05:17.338Z',
        '2017-09-09T16:05:17.338Z',
        '2017-09-09T16:05:18.338Z'
      ];
      assert.strictEqual(
        helper.previousDateStr('2017-09-29T16:05:17.338Z', allDateStrs),
        '2017-09-19T16:05:17.338Z'
      );
    });
  });
});
