let mocha = require('mocha');
let assert = require('chai').assert;
let helper = require('../src/helper');

suite('helper.js', () => {
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
  suite('getKeyName', () => {
    test('get the correct key path to the current key', () => {
      assert.strictEqual(
        helper.getKeyName('teller-responses/account/direct_debits/changed_file'),
        'changed_file'
      )
    });
    test('return current key if it is a top level key', () => {
      assert.strictEqual(helper.getKeyName('teller-responses'), 'teller-responses');
    });
    test('shit the bed if the provided key is blank', () => {
      assert.throws(() => {return helper.getKeyName('')});
    });
    test('shit the bed if the provided key is not a string', () => {
      assert.throws(() => {return helper.getKeyName(null)});
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
      [
        {date: '2017-09-29T16:05:17.338Z', expected: '2017-09-19T16:05:17.338Z'},
        {date: '2017-09-10T16:05:17.338Z', expected: '2017-09-09T16:05:18.338Z'}
      ].forEach((entry, expected) => {
        assert.strictEqual(
          helper.previousDateStr(entry.date, allDateStrs), entry.expected);
      });
    });
    test('should shit the bed if start is not a string', () => {
      assert.throws(() => { return helper.previousDateStr(null, []) });
    });
    test('should shit the bed if dates is not an array', () => {
      assert.throws(() =>  { return helper.previousDateStr('str', 'null') });
    });
  });
});
