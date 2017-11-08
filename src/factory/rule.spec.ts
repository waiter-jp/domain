/**
 * 発行規則ファクトリーテスト
 * @ignore
 */

import * as assert from 'assert';

import * as errors from './errors';
import * as RuleFactory from './rule';

let TEST_CREATE_PARAMS: any;

describe('RuleFactory.create()', () => {
    beforeEach(() => {
        TEST_CREATE_PARAMS = {
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 100
        };
    });

    it('作成できる', () => {
        assert.doesNotThrow(() => {
            RuleFactory.create(TEST_CREATE_PARAMS);
        });
    });

    it('scopeが空であればArgumentNullError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.scope = '';
                RuleFactory.create(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof errors.ArgumentNull);

                return true;
            }
        );
    });

    it('aggregationUnitInSecondsが数字でなければArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.aggregationUnitInSeconds = <any>'1';
                RuleFactory.create(TEST_CREATE_PARAMS);
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
                TEST_CREATE_PARAMS.threshold = <any>'1';
                RuleFactory.create(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof errors.Argument);

                return true;
            }
        );
    });
});
