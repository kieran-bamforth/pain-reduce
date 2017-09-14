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
  suite('getObjectModifiedBefore', () => {
    let objects;
    before(() => {
      objects = {
        "Contents": [
          {
            "LastModified": "2017-08-08T10:52:59.000Z",
            "ETag": "\"d41d8cd98f00b204e9800998ecf8427e\"",
            "StorageClass": "STANDARD",
            "Key": "small",
            "Size": 0
          },
          {
            "LastModified": "2017-09-14T14:54:18.000Z",
            "ETag": "\"b90244d8a932ba58ec7f0681cc12e16c\"",
            "StorageClass": "STANDARD",
            "Key": "medium",
            "Size": 2093438
          },
          {
            "LastModified": "2017-09-14T14:54:08.000Z",
            "ETag": "\"d04911cd1958467c68e057be215129ae-2\"",
            "StorageClass": "STANDARD",
            "Key": "large",
            "Size": 10800493
          }
        ]
      }
    });
    test.skip('should get the previous object', () => {  });
    test.skip('should throw an error if there are no previous objects', () => {  });
    test.skip('should throw an error if previous objects is an empty array', () => {  });
    test.skip('should throw an error if start is not a string', () => {  });
    test.skip('should throw an error if objects is not an object', () => {  });
  });
});
