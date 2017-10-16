/**
 * ArgumentNullErrorテスト
 * @ignore
 */

import * as assert from 'assert';

import ArgumentNullError from './argumentNull';
import { WaiterError } from './waiter';

describe('new ArgumentNullError()', () => {
    it('正しくインスタンス化できる', async () => {
        const argumentName = 'testname';
        const message = 'test message';
        const argumentError = new ArgumentNullError(argumentName, message);
        assert(argumentError instanceof Error);
        assert.equal(argumentError.argumentName, argumentName);
        assert.equal(argumentError.message, message);
        assert.equal(argumentError.name, WaiterError.name);
        assert.equal(typeof argumentError.stack, 'string');
    });

    it('メッセージを指定しなくても、正しくインスタンス化できる', async () => {
        const argumentName = 'testname';
        const argumentError = new ArgumentNullError(argumentName);
        assert(argumentError instanceof Error);
        assert.equal(argumentError.argumentName, argumentName);
        assert.equal(argumentError.name, WaiterError.name);
        assert.equal(typeof argumentError.message, 'string');
        assert.equal(typeof argumentError.stack, 'string');
    });
});
