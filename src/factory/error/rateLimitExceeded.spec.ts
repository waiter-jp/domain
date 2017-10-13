/**
 * RateLimitExceededErrorテスト
 * @ignore
 */

import * as assert from 'assert';

import RateLimitExceededError from './rateLimitExceeded';
import { WaiterError } from './waiter';

describe('new NotFoundError()', () => {
    it('正しくインスタンス化できる', async () => {
        const message = 'test message';
        const rateLimitExceededError = new RateLimitExceededError(message);
        assert(rateLimitExceededError instanceof Error);
        assert.equal(rateLimitExceededError.message, message);
        assert.equal(rateLimitExceededError.name, WaiterError.name);
        assert.equal(typeof rateLimitExceededError.stack, 'string');
    });

    it('メッセージを指定しなくても、正しくインスタンス化できる', async () => {
        const rateLimitExceededError = new RateLimitExceededError();
        assert(rateLimitExceededError instanceof Error);
        assert.equal(rateLimitExceededError.name, WaiterError.name);
        assert.equal(typeof rateLimitExceededError.message, 'string');
        assert.equal(typeof rateLimitExceededError.stack, 'string');
    });
});
