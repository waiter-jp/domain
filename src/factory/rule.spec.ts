/**
 * 発行規則ファクトリーテスト
 * @ignore
 */

import * as assert from 'assert';

import * as errors from './errors';
import * as RuleFactory from './rule';

let TEST_CREATE_PARAMS: any;

describe('RuleFactory.createFromObject()', () => {
    beforeEach(() => {
        TEST_CREATE_PARAMS = {
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 100,
            unavailableHoursSpecifications: [
                {
                    startDate: '2017-11-10T09:00:00Z',
                    endDate: '2017-11-10T09:30:00Z'
                }
            ]
        };
    });

    it('作成できる', () => {
        assert.doesNotThrow(() => {
            RuleFactory.createFromObject(TEST_CREATE_PARAMS);
        });
    });

    it('scopeが空であればArgumentNullError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.scope = '';
                RuleFactory.createFromObject(TEST_CREATE_PARAMS);
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
                RuleFactory.createFromObject(TEST_CREATE_PARAMS);
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
                RuleFactory.createFromObject(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof errors.Argument);

                return true;
            }
        );
    });

    it('unavailableHoursSpecificationsが配列でなければArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.unavailableHoursSpecifications = {};
                RuleFactory.createFromObject(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof errors.Argument);

                return true;
            }
        );
    });

    it('サービス休止時間帯の開始日時が不適切であればArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.unavailableHoursSpecifications[0].startDate = 'xxx';
                RuleFactory.createFromObject(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof errors.Argument);

                return true;
            }
        );
    });

    it('サービス休止時間帯の終了日時が不適切であればArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.unavailableHoursSpecifications[0].endDate = 'xxx';
                RuleFactory.createFromObject(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof errors.Argument);

                return true;
            }
        );
    });
});
