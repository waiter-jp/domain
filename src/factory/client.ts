/**
 * クライアントファクトリー
 * @namespace factory.client
 */

import * as validator from 'validator';

import * as errors from './errors';

export interface IPassportIssueRule {
    /**
     * 許可証数集計単位(秒)
     */
    aggregationUnitInSeconds: number;
    /**
     * 単位時間当たりの許可証数閾値
     */
    threshold: number;
}

/**
 * クライアントインターフェース
 * @export
 * @interface
 * @memberof factory.client
 */
export interface IClient {
    /**
     * クライアントID
     * @memberof IClient
     */
    id: string;
    /**
     * クライアントシークレット
     * クライアントのパスポートをトークン化する際に使用
     * また、このシークレットをクライアントに共有することで、クライアントがトークンを検証できるようにする
     * クライアント側で管理を徹底することが前提
     * @memberof IClient
     */
    secret: string;
    /**
     * 許可証発行ルール
     * @memberof IClient
     */
    passportIssueRule: IPassportIssueRule;
}

export function create(params: {
    id: string;
    secret: string;
    passportIssueRule: IPassportIssueRule;
}): IClient {
    if (validator.isEmpty(params.id)) {
        throw new errors.ArgumentNull('id');
    }
    if (validator.isEmpty(params.secret)) {
        throw new errors.ArgumentNull('secret');
    }
    if (params.passportIssueRule === undefined || params.passportIssueRule === null) {
        throw new errors.Argument('passportIssueRule', 'passportIssueRule must be object');
    }
    if (!Number.isInteger(params.passportIssueRule.aggregationUnitInSeconds)) {
        throw new errors.Argument('passportIssueRule.aggregationUnitInSeconds', 'aggregationUnitInSeconds must be number');
    }
    if (!Number.isInteger(params.passportIssueRule.threshold)) {
        throw new errors.Argument('passportIssueRule.threshold', 'threshold must be number');
    }

    return {
        id: params.id,
        secret: params.secret,
        passportIssueRule: params.passportIssueRule
    };
}
