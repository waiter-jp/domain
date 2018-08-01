/**
 * 許可証発行ルールファクトリー
 * @namespace factory.rule
 */

import * as moment from 'moment';
import * as validator from 'validator';

import * as errors from './errors';

/**
 * サービス休止時間帯インターフェース
 */
export interface IUnavailableHoursSpecification {
    startDate: Date;
    endDate: Date;
}

/**
 * 許可証発行規則インターフェース
 */
export interface IRule {
    /**
     * 規則名称
     */
    name: string;
    /**
     * 規則説明
     */
    description: string;
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
    /**
     * 発行サービスを利用できない時間帯
     */
    unavailableHoursSpecifications: IUnavailableHoursSpecification[];
}

export function createFromObject(params: any): IRule {
    if (typeof params.name !== 'string' || validator.isEmpty(params.name)) {
        throw new errors.ArgumentNull('name');
    }
    if (typeof params.description !== 'string' || validator.isEmpty(params.description)) {
        throw new errors.ArgumentNull('description');
    }
    if (typeof params.scope !== 'string' || validator.isEmpty(params.scope)) {
        throw new errors.ArgumentNull('scope');
    }
    if (!Number.isInteger(params.aggregationUnitInSeconds)) {
        throw new errors.Argument('aggregationUnitInSeconds', 'aggregationUnitInSeconds must be number.');
    }
    if (!Number.isInteger(params.threshold)) {
        throw new errors.Argument('threshold', 'threshold must be number.');
    }
    if (!Array.isArray(params.unavailableHoursSpecifications)) {
        throw new errors.Argument('unavailableHoursSpecifications', 'unavailableHoursSpecifications must be an array.');
    }
    params.unavailableHoursSpecifications.forEach((unavailableHoursSpecification) => {
        if (!moment(unavailableHoursSpecification.startDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid()) {
            throw new errors.Argument('unavailableHoursSpecification.startDate', 'unavailableHoursSpecification.startDate must be Date.');
        }
        if (!moment(unavailableHoursSpecification.endDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid()) {
            throw new errors.Argument('unavailableHoursSpecification.endDate', 'unavailableHoursSpecification.endDate must be Date.');
        }
    });

    return {
        name: params.name,
        description: params.description,
        scope: params.scope,
        aggregationUnitInSeconds: params.aggregationUnitInSeconds,
        threshold: params.threshold,
        unavailableHoursSpecifications: params.unavailableHoursSpecifications.map((unavailableHoursSpecification) => {
            return {
                startDate: moment(unavailableHoursSpecification.startDate, 'YYYY-MM-DDTHH:mm:ssZ').toDate(),
                endDate: moment(unavailableHoursSpecification.endDate, 'YYYY-MM-DDTHH:mm:ssZ').toDate()
            };
        })
    };
}
