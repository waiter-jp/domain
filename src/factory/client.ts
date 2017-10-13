/**
 * クライアントファクトリー
 * @namespace factory.client
 */

import * as _ from 'underscore';

import * as errors from './errors';

/**
 * クライアントインターフェース
 * @export
 * @interface
 * @memberof factory.client
 */
export interface IClient {
    /**
     * クライアントID
     * @type {string}
     * @memberof IClient
     */
    id: string;
    /**
     * クライアントシークレット
     * クライアントのパスポートをトークン化する際に使用
     * また、このシークレットをクライアントに共有することで、クライアントがトークンを検証できるようにする
     * クライアント側で管理を徹底することが前提
     * @type {string}
     * @memberof IClient
     */
    secret: string;
    /**
     * パスポート発行者の勤務シフト時間(秒)
     * @type {number}
     * @memberof IClient
     */
    passportIssuerWorkShiftInSesonds: number;
    /**
     * 発行者ひとりあたりのパスポート発行可能数
     * @type {number}
     * @memberof IClient
     */
    totalNumberOfPassportsPerIssuer: number;
}

export function create(params: {
    id: string;
    secret: string;
    passportIssuerWorkShiftInSesonds: number;
    totalNumberOfPassportsPerIssuer: number;
}): IClient {
    if (_.isEmpty(params.id)) {
        throw new errors.ArgumentNull('id');
    }
    if (_.isEmpty(params.secret)) {
        throw new errors.ArgumentNull('secret');
    }
    if (!_.isNumber(params.passportIssuerWorkShiftInSesonds)) {
        throw new errors.Argument('passportIssuerWorkShiftInSesonds', 'passportIssuerWorkShiftInSesonds must be number');
    }
    if (!_.isNumber(params.totalNumberOfPassportsPerIssuer)) {
        throw new errors.Argument('totalNumberOfPassportsPerIssuer', 'totalNumberOfPassportsPerIssuer must be number');
    }

    return {
        id: params.id,
        secret: params.secret,
        passportIssuerWorkShiftInSesonds: params.passportIssuerWorkShiftInSesonds,
        totalNumberOfPassportsPerIssuer: params.totalNumberOfPassportsPerIssuer
    };
}
