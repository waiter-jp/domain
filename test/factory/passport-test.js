"use strict";
/**
 * パスポートファクトリーテスト
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const argument_1 = require("../../lib/error/argument");
const argumentNull_1 = require("../../lib/error/argumentNull");
const PassportFactory = require("../../lib/factory/passport");
const TEST_CREATE_ARGS = {
    client: 'testclient',
    scope: 'testscope',
    issuer: 'testissuer',
    issued_place: 1
};
describe('パスポートファクトリー:作成', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            PassportFactory.create(TEST_CREATE_ARGS);
        });
    });
    it('クライアントが空であればArgumentNullError', () => {
        assert.throws(() => {
            const args = Object.assign({}, TEST_CREATE_ARGS, { client: '' });
            PassportFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert(err.argumentName, 'client');
            return true;
        });
    });
    it('スコープが空であればArgumentNullError', () => {
        assert.throws(() => {
            const args = Object.assign({}, TEST_CREATE_ARGS, { scope: '' });
            PassportFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert(err.argumentName, 'scope');
            return true;
        });
    });
    it('発行者が空であればArgumentNullError', () => {
        assert.throws(() => {
            const args = Object.assign({}, TEST_CREATE_ARGS, { issuer: '' });
            PassportFactory.create(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert(err.argumentName, 'issuer');
            return true;
        });
    });
    it('順番が数字でなければArgumentError', () => {
        assert.throws(() => {
            const args = Object.assign({}, TEST_CREATE_ARGS, { issued_place: '1' });
            PassportFactory.create(args);
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert(err.argumentName, 'issued_place');
            return true;
        });
    });
});
