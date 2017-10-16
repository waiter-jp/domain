/**
 * クライアントファクトリーテスト
 * @ignore
 */

import * as assert from 'assert';

import * as ClientFactory from './client';
import * as errors from './errors';

let TEST_CREATE_PARAMS: any;

describe('ClientFactory.create()', () => {
    beforeEach(() => {
        TEST_CREATE_PARAMS = {
            id: 'id',
            secret: 'secret',
            passportIssueRule: {
                aggregationUnitInSeconds: 60,
                threshold: 100
            }
        };
    });

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

    it('passportIssueRuleがオブジェクトでなければArgumentError', () => {
        assert.throws(
            () => {
                const params = { ...TEST_CREATE_PARAMS, ...{ passportIssueRule: <any>null } };
                ClientFactory.create(params);
            },
            (err: any) => {
                assert(err instanceof errors.Argument);

                return true;
            }
        );
    });

    it('aggregationUnitInSecondsが数字でなければArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.passportIssueRule.aggregationUnitInSeconds = <any>'1';
                ClientFactory.create(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof errors.Argument);

                return true;
            }
        );
    });

    it('thresholdが数字でなければArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.passportIssueRule.threshold = <any>'1';
                ClientFactory.create(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof errors.Argument);

                return true;
            }
        );
    });
});
