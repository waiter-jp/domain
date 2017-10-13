/**
 * クライアントファクトリーテスト
 * @ignore
 */

import * as assert from 'assert';

import * as ClientFactory from './client';
import * as errors from './errors';

const TEST_CREATE_PARAMS = {
    id: 'id',
    secret: 'secret',
    passportIssuerWorkShiftInSesonds: 60,
    totalNumberOfPassportsPerIssuer: 100
};

describe('ClientFactory.create()', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            ClientFactory.create(TEST_CREATE_PARAMS);
        });
    });

    it('idが空であればArgumentNullError', () => {
        assert.throws(
            () => {
                const params = { ...TEST_CREATE_PARAMS, ...{ id: '' } };
                ClientFactory.create(params);
            },
            (err: any) => {
                assert(err instanceof errors.ArgumentNull);

                return true;
            }
        );
    });

    it('secretが空であればArgumentNullError', () => {
        assert.throws(
            () => {
                const params = { ...TEST_CREATE_PARAMS, ...{ secret: '' } };
                ClientFactory.create(params);
            },
            (err: any) => {
                assert(err instanceof errors.ArgumentNull);

                return true;
            }
        );
    });

    it('passportIssuerWorkShiftInSesondsが数字でなければArgumentError', () => {
        assert.throws(
            () => {
                const params = { ...TEST_CREATE_PARAMS, ...{ passportIssuerWorkShiftInSesonds: <any>'1' } };
                ClientFactory.create(params);
            },
            (err: any) => {
                assert(err instanceof errors.Argument);

                return true;
            }
        );
    });

    it('totalNumberOfPassportsPerIssuerが数字でなければArgumentError', () => {
        assert.throws(
            () => {
                const params = { ...TEST_CREATE_PARAMS, ...{ totalNumberOfPassportsPerIssuer: <any>'1' } };
                ClientFactory.create(params);
            },
            (err: any) => {
                assert(err instanceof errors.Argument);

                return true;
            }
        );
    });
});
