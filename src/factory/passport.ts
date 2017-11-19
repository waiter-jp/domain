/**
 * 許可証ファクトリー
 * @namespace factory.passport
 */

import * as validator from 'validator';

import ArgumentError from './error/argument';
import ArgumentNullError from './error/argumentNull';

/**
 * 許可証発行単位
 * @export
 * @interface
 * @memberof factory.passport
 */
export interface IIssueUnit {
    /**
     * 許可証発行単位識別子
     * 発行単位内で整理番号付けを行う
     * スコープ+日時で一意になる想定
     * @memberof IIssueUnit
     */
    identifier: string;
    /**
     * いつから有効な発行単位か
     * unix timestampe
     * @memberof IIssueUnit
     */
    validFrom: number;
    /**
     * いつまで有効な発行単位か
     * unix timestampe
     * @memberof IIssueUnit
     */
    validThrough: number;
    /**
     * 許可証発行リクエスト数
     * @memberof IIssueUnit
     */
    numberOfRequests: number;
}

/**
 * 許可証インターフェース
 * どういうスコープに対する許可なのか、という情報を持つ。
 * 実際には許可証がjsonwebtokenに変換されて発行されるので、許可証の有効期間に関してはtokenが責任を持つことになる。
 * @export
 * @interface
 * @memberof factory.passport
 */
export interface IPassport {
    /**
     * 許可証のスコープ
     * 発行依頼者が事前に設定する想定
     * @memberof IPassport
     */
    scope: string;
    /**
     * 発行unixタイムスタンプ
     * @memberof IPassport
     */
    iat: number;
    /**
     * 期限unixタイムスタンプ
     * @memberof IPassport
     */
    exp: number;
    /**
     * 許可証発行者
     * @memberof IPassport
     * @example https://waiter.example.com
     */
    iss: string;
    /**
     * 許可証発行単位名
     * 発行単位内で整理番号付けを行う
     * @memberof IPassport
     */
    issueUnit: IIssueUnit;
}

export type IEncodedPassport = string;

export function create(params: {
    scope: string;
    iat: number;
    exp: number;
    iss: string;
    issueUnit: IIssueUnit;
}): IPassport {
    if (validator.isEmpty(params.scope)) {
        throw new ArgumentNullError('scope');
    }
    if (params.iat === undefined || !Number.isInteger(params.iat)) {
        throw new ArgumentError('iat', 'iat must be number.');
    }
    if (params.exp === undefined || !Number.isInteger(params.exp)) {
        throw new ArgumentError('exp', 'exp must be number.');
    }
    if (validator.isEmpty(params.iss)) {
        throw new ArgumentNullError('iss');
    }
    if (params.issueUnit == null || typeof params.issueUnit !== 'object') {
        throw new ArgumentError('issueUnit', 'issueUnit must be object.');
    }
    if (validator.isEmpty(params.issueUnit.identifier)) {
        throw new ArgumentNullError('issueUnit.identifier');
    }
    if (params.issueUnit.numberOfRequests === undefined || !Number.isInteger(params.issueUnit.numberOfRequests)) {
        throw new ArgumentError('issueUnit.numberOfRequests', 'issueUnit.numberOfRequests must be number.');
    }

    return {
        scope: params.scope,
        iat: params.iat,
        exp: params.exp,
        iss: params.iss,
        issueUnit: params.issueUnit
    };
}
