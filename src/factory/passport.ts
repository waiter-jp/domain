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
     * 許可証発行者
     * @memberof IPassport
     */
    iss: string;
    /**
     * 誰に対して発行された許可証か
     * @memberof IPassport
     */
    // aud: string;
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
    iss: string;
    // aud: string;
    issueUnit: IIssueUnit;
}): IPassport {
    // if (validator.isEmpty(params.aud)) {
    //     throw new ArgumentNullError('aud');
    // }
    if (validator.isEmpty(params.scope)) {
        throw new ArgumentNullError('scope');
    }
    if (validator.isEmpty(params.iss)) {
        throw new ArgumentNullError('iss');
    }
    if (validator.isEmpty(params.issueUnit.identifier)) {
        throw new ArgumentNullError('issueUnit.identifier');
    }
    if (!Number.isInteger(params.issueUnit.numberOfRequests)) {
        throw new ArgumentError('issueUnit.numberOfRequests', 'issueUnit.numberOfRequests must be number');
    }

    return {
        scope: params.scope,
        iss: params.iss,
        // aud: params.aud,
        issueUnit: params.issueUnit
    };
}
