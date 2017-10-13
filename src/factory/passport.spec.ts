/**
 * 許可証ファクトリーテスト
 * @ignore
 */

import * as assert from 'assert';

import * as errors from './errors';
import * as PassportFactory from './passport';

const TEST_CREATE_PARAMS = {
    scope: 'scope',
    issuer: 'issuer',
    audience: 'audience',
    issuedPlace: 1
};

describe('パスポートファクトリー:作成', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            PassportFactory.create(TEST_CREATE_PARAMS);
        });
    });

    it('クライアントが空であればArgumentNullError', () => {
        assert.throws(
            () => {
                const params = { ...TEST_CREATE_PARAMS, ...{ audience: '' } };
                PassportFactory.create(params);
            },
            (err: any) => {
                assert(err instanceof errors.ArgumentNull);

                return true;
            }
        );
    });

    it('スコープが空であればArgumentNullError', () => {
        assert.throws(
            () => {
                const params = { ...TEST_CREATE_PARAMS, ...{ scope: '' } };
                PassportFactory.create(params);
            },
            (err: any) => {
                assert(err instanceof errors.ArgumentNull);

                return true;
            }
        );
    });

    it('発行者が空であればArgumentNullError', () => {
        assert.throws(
            () => {
                const params = { ...TEST_CREATE_PARAMS, ...{ issuer: '' } };
                PassportFactory.create(params);
            },
            (err: any) => {
                assert(err instanceof errors.ArgumentNull);

                return true;
            }
        );
    });

    it('順番が数字でなければArgumentError', () => {
        assert.throws(
            () => {
                const params = { ...TEST_CREATE_PARAMS, ...{ issuedPlace: <any>'1' } };
                PassportFactory.create(params);
            },
            (err: any) => {
                assert(err instanceof errors.Argument);

                return true;
            }
        );
    });
});
