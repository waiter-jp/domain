/**
 * ArgumentErrorテスト
 *
 * @ignore
 */

import * as assert from 'assert';

import WaiterError from '../../lib/error';
import ArgumentError from '../../lib/error/argument';

describe('引数無効エラー', () => {
    it('正しくインスタンス化できる', async () => {
        const argumentName = 'testname';
        const message = 'test message';
        const argumentError = new ArgumentError(argumentName, message);
        assert(argumentError instanceof Error);
        assert.equal(argumentError.argumentName, argumentName);
        assert.equal(argumentError.message, message);
        assert.equal(argumentError.name, WaiterError.name);
        assert.equal(typeof argumentError.stack, 'string');
    });

    it('メッセージを指定しなくても、正しくインスタンス化できる', async () => {
        const argumentName = 'testname';
        const argumentError = new ArgumentError(argumentName);
        assert(argumentError instanceof Error);
        assert.equal(argumentError.argumentName, argumentName);
        assert.equal(argumentError.name, WaiterError.name);
        assert.equal(typeof argumentError.message, 'string');
        assert.equal(typeof argumentError.stack, 'string');
    });
});
