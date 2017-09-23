const mocha = require('mocha');
const assert = require('chai').assert;
const helper = require('../src/helper');

suite('helper.js', () => {
  suite('getKeyPath', () => {
    test('get the correct key path to the current key', () => {
      assert.strictEqual(
        helper.getKeyPath('teller-responses/account/direct_debits/changed_file'),
        'teller-responses/account/direct_debits'
      );
    });
    test('return a blank key path if this is a root level item', () => {
      assert.strictEqual(helper.getKeyPath('teller-responses'), '');
    });
    test('throw an error if the provided key is blank', () => {
      assert.throws(() => { return helper.getKeyPath(''); });
    });
    test('throw an error if the provided key is not a string', () => {
      assert.throws(() => { return helper.getKeyPath(null); });
    });
  });
  suite('getKeyName', () => {
    test('get the correct key path to the current key', () => {
      assert.strictEqual(
        helper.getKeyName('teller-responses/account/direct_debits/changed_file'),
        'changed_file'
      );
    });
    test('return current key if it is a top level key', () => {
      assert.strictEqual(helper.getKeyName('teller-responses'), 'teller-responses');
    });
    test('throw an error if the provided key is blank', () => {
      assert.throws(() => { return helper.getKeyName(''); });
    });
    test('throw an error if the provided key is not a string', () => {
      assert.throws(() => { return helper.getKeyName(null); });
    });
  });
  suite('getObjectModifiedBefore', () => {
    let objects;

    before(() => {
      objects = [
        { LastModified: '2017-08-08T10:52:59.000Z' },
        { LastModified: '2017-09-14T14:54:18.000Z' },
        { LastModified: '2017-09-16T14:54:08.000Z' }
      ];
    });

    test('should get the previous object', () => {
      [
        { lastModified: '2017-09-14T14:54:18.000Z', expected: '2017-08-08T10:52:59.000Z' },
        { lastModified: '2017-09-16T14:54:08.000Z', expected: '2017-09-14T14:54:18.000Z' }
      ].forEach((entry) => {
        assert.deepEqual(
          helper.getObjectModifiedBefore(entry.lastModified, objects),
          { LastModified: entry.expected }
        );
      });
    });
    test('should throw an error if there are no previous objects', () => {
      assert.throws(() => { helper.getObjectModifiedBefore('2017-08-08T10:52:59.000Z', objects); } );
    });
    test('should throw an error if previous objects is an empty array', () => {
      assert.throws(() => { helper.getObjectModifiedBefore('2017-08-08T10:52:59.000Z', []); } );
    });
    test('should throw an error if date is not a string', () => {
      assert.throws(() => { helper.getObjectModifiedBefore(null, objects); } );
    });
    test('should throw an error if objects is not an array', () => {
      assert.throws(() => { helper.getObjectModifiedBefore('2017-08-08T10:52:59.000Z', null); } );
    });
  });
  suite('mergeDiffsWithToObject', () => {
    test('should merge the "to" objects with the diffs', () => {
      let diffs = [
        {"path": [0, "genericKey"]}
      ];
      let toObject = [
        {"genericKey": "genericValue", "genericKey2": "genericValue2"}
      ];
      let expected = [
        {
          "path":[0,"genericKey"],
          "to": {"genericKey": "genericValue", "genericKey2": "genericValue2"}
        }
      ];
      assert.deepEqual(
        helper.mergeDiffsWithToObject(diffs, toObject),
        expected
      );
    });
  });
});
