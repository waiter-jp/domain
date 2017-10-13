/**
 * NotFoundErrorテスト
 * @ignore
 */

import * as assert from 'assert';

import NotFoundError from './notFound';
import { WaiterError } from './waiter';

describe('new NotFoundError()', () => {
    it('正しくインスタンス化できる', async () => {
        const entityName = 'entityName';
        const message = 'test message';
        const notFoundError = new NotFoundError(entityName, message);
        assert(notFoundError instanceof Error);
        assert.equal(notFoundError.entityName, entityName);
        assert.equal(notFoundError.message, message);
        assert.equal(notFoundError.name, WaiterError.name);
        assert.equal(typeof notFoundError.stack, 'string');
    });

    it('メッセージを指定しなくても、正しくインスタンス化できる', async () => {
        const entityName = 'testname';
        const notFoundError = new NotFoundError(entityName);
        assert(notFoundError instanceof Error);
        assert.equal(notFoundError.entityName, entityName);
        assert.equal(notFoundError.name, WaiterError.name);
        assert.equal(typeof notFoundError.message, 'string');
        assert.equal(typeof notFoundError.stack, 'string');
    });
});
