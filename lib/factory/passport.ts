/**
 * 許可証ファクトリー
 *
 * @namespace factory/passport
 */

import * as _ from 'underscore';

import ArgumentError from '../error/argument';
import ArgumentNullError from '../error/argumentNull';

/**
 * 許可証インターフェース
 * どのクライアントの、どういうスコープに対する許可なのか、という情報を持つ。
 * 実際にはパスポートがjsonwebtokenに変換されて発行されるので、パスポートの有効期間に関してはtokenが責任を持つことになる。
 *
 * @interface IPassport
 * @memberof factory/passport
 */
export interface IPassport {
    /**
     * 許可証を発行したクライアントID
     *
     * @type {string}
     * @memberof IPassport
     */
    client: string;
    /**
     * 許可証のスコープ
     * クライアントが設定&管理する想定
     *
     * @type {string}
     * @memberof IPassport
     */
    scope: string;
    /**
     * パスポート発行者
     * 発行者がその勤務シフト時間内で整理番号付けを行う
     *
     * @type {string}
     * @memberof IPassport
     */
    issuer: string;
    /**
     * 発行された順番
     *
     * @type {number}
     * @memberof IPassport
     */
    issued_place: number;
}

export function create(args: {
    client: string;
    scope: string;
    issuer: string;
    issued_place: number;
}): IPassport {
    if (_.isEmpty(args.client)) {
        throw new ArgumentNullError('client');
    }
    if (_.isEmpty(args.scope)) {
        throw new ArgumentNullError('scope');
    }
    if (_.isEmpty(args.issuer)) {
        throw new ArgumentNullError('issuer');
    }
    if (!_.isNumber(args.issued_place)) {
        throw new ArgumentError('issued_place', 'issued_place should be number');
    }

    return {
        client: args.client,
        scope: args.scope,
        issuer: args.issuer,
        issued_place: args.issued_place
    };
}
