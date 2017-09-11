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
    test('throw an error if the provided key is blank', () => {
      assert.throws(() => {return helper.getKeyPath('')});
    });
    test('throw an error if the provided key is not a string', () => {
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
    test('throw an error if the provided key is blank', () => {
      assert.throws(() => {return helper.getKeyName('')});
    });
    test('throw an error if the provided key is not a string', () => {
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
    test('should throw an error if there are no previous date strs', () => {
      assert.throws(() => {
        return helper.previousDateStr('2017-09-10T16:05:17.338Z', ['2017-09-20T16:05:17.338Z']);
      });
    });
    test('should throw an error dates is an empty array', () => {
      assert.throws(() => { return helper.previousDateStr('2017-09-10T16:05:17.338Z', []); });
    });
    test('should throw an error if start is not a string', () => {
      assert.throws(() => { return helper.previousDateStr(null, []) });
    });
    test('should throw an error if dates is not an array', () => {
      assert.throws(() =>  { return helper.previousDateStr('str', null) });
    });
  });
  suite('array', () => {
    test('does the map function work the way I expect it to?', () => {
      let data = {
        Contents: [
          {
            ETag: "\"70ee1738b6b21e2c8a43f3a5ab0eee71\"",
            Key: "happyface.jpg",
            LastModified: 'datestr',
            Size: 11,
            StorageClass: "STANDARD"
          },
          {
            ETag: "\"becf17f89c30367a9a44495d62ed521a-1\"",
            Key: "test.jpg",
            LastModified: 'datestr',
            Size: 4192256,
            StorageClass: "STANDARD"
          }
        ],
        IsTruncated: true,
        KeyCount: 2,
        MaxKeys: 2,
        Name: "examplebucket",
        NextContinuationToken: "1w41l63U0xa8q7smH50vCxyTQqdxo69O3EmK28Bi5PcROI4wI/EyIJg==",
        Prefix: ""
      }
      assert.deepEqual(
        data.Contents.map(entry => entry.Key),
        ['happyface.jpg', 'test.jpg']
      );
    });
  });
});
