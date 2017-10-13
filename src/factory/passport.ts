/**
 * 許可証ファクトリー
 * @namespace factory.passport
 */

import * as _ from 'underscore';

import ArgumentError from './error/argument';
import ArgumentNullError from './error/argumentNull';

/**
 * 許可証インターフェース
 * どのクライアントの、どういうスコープに対する許可なのか、という情報を持つ。
 * 実際にはパスポートがjsonwebtokenに変換されて発行されるので、パスポートの有効期間に関してはtokenが責任を持つことになる。
 * @export
 * @interface
 * @memberof factory.passport
 */
export interface IPassport {
    /**
     * 許可証を発行したクライアントID
     * @type {string}
     * @memberof IPassport
     */
    client: string;
    /**
     * 許可証のスコープ
     * クライアントが設定&管理する想定
     * @type {string}
     * @memberof IPassport
     */
    scope: string;
    /**
     * パスポート発行者
     * 発行者がその勤務シフト時間内で整理番号付けを行う
     * @type {string}
     * @memberof IPassport
     */
    issuer: string;
    /**
     * 発行された順番
     * @type {number}
     * @memberof IPassport
     */
    issuedPlace: number;
}

export function create(params: {
    client: string;
    scope: string;
    issuer: string;
    issuedPlace: number;
}): IPassport {
    if (_.isEmpty(params.client)) {
        throw new ArgumentNullError('client');
    }
    if (_.isEmpty(params.scope)) {
        throw new ArgumentNullError('scope');
    }
    if (_.isEmpty(params.issuer)) {
        throw new ArgumentNullError('issuer');
    }
    if (!_.isNumber(params.issuedPlace)) {
        throw new ArgumentError('issuedPlace', 'issuedPlace must be number');
    }

    return {
        client: params.client,
        scope: params.scope,
        issuer: params.issuer,
        issuedPlace: params.issuedPlace
    };
}
