/**
 * 許可証発行ルールファクトリー
 * @namespace factory.rule
 */

import * as validator from 'validator';

import * as errors from './errors';

export interface IRule {
    /**
     * スコープ
     */
    scope: string;
    /**
     * 許可証数集計単位(秒)
     */
    aggregationUnitInSeconds: number;
    /**
     * 単位時間当たりの許可証数閾値
     */
    threshold: number;
}

export function create(params: {
    scope: string;
    aggregationUnitInSeconds: number;
    threshold: number;
}): IRule {
    if (validator.isEmpty(params.scope)) {
        throw new errors.ArgumentNull('scope');
    }
    if (!Number.isInteger(params.aggregationUnitInSeconds)) {
        throw new errors.Argument('aggregationUnitInSeconds', 'aggregationUnitInSeconds must be number');
    }
    if (!Number.isInteger(params.threshold)) {
        throw new errors.Argument('threshold', 'threshold must be number');
    }

    return params;
}
