/**
 * 許可証ファクトリー
 * @namespace factory.passport
 */

import * as validator from 'validator';

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
     * 誰に対して発行された許可証か
     * 許可証を発行したクライアントIDがここにセットされるので、アプリケーションサイドで適宜この値を確認するべし。
     * @type {string}
     * @memberof IPassport
     */
    audience: string;
    /**
     * 発行された順番
     * @type {number}
     * @memberof IPassport
     */
    issuedPlace: number;
}

export function create(params: {
    scope: string;
    issuer: string;
    audience: string;
    issuedPlace: number;
}): IPassport {
    if (validator.isEmpty(params.audience)) {
        throw new ArgumentNullError('audience');
    }
    if (validator.isEmpty(params.scope)) {
        throw new ArgumentNullError('scope');
    }
    if (validator.isEmpty(params.issuer)) {
        throw new ArgumentNullError('issuer');
    }
    if (!Number.isInteger(params.issuedPlace)) {
        throw new ArgumentError('issuedPlace', 'issuedPlace must be number');
    }

    return {
        scope: params.scope,
        issuer: params.issuer,
        audience: params.audience,
        issuedPlace: params.issuedPlace
    };
}
