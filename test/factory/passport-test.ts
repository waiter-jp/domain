/**
 * パスポートファクトリーテスト
 *
 * @ignore
 */

import * as assert from 'assert';

import ArgumentError from '../../lib/error/argument';
import ArgumentNullError from '../../lib/error/argumentNull';

import * as PassportFactory from '../../lib/factory/passport';

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
        assert.throws(
            () => {
                const args = { ...TEST_CREATE_ARGS, ...{ client: '' } };
                PassportFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert((<ArgumentNullError>err).argumentName, 'client');

                return true;
            }
        );
    });

    it('スコープが空であればArgumentNullError', () => {
        assert.throws(
            () => {
                const args = { ...TEST_CREATE_ARGS, ...{ scope: '' } };
                PassportFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert((<ArgumentNullError>err).argumentName, 'scope');

                return true;
            }
        );
    });

    it('発行者が空であればArgumentNullError', () => {
        assert.throws(
            () => {
                const args = { ...TEST_CREATE_ARGS, ...{ issuer: '' } };
                PassportFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert((<ArgumentNullError>err).argumentName, 'issuer');

                return true;
            }
        );
    });

    it('順番が数字でなければArgumentError', () => {
        assert.throws(
            () => {
                const args = { ...TEST_CREATE_ARGS, ...{ issued_place: <any>'1' } };
                PassportFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert((<ArgumentError>err).argumentName, 'issued_place');

                return true;
            }
        );
    });
});
