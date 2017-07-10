/**
 * クライアントファクトリー
 *
 * @namespace factory/client
 */
/**
 * クライアントインターフェース
 *
 * @interface IClient
 * @memberof factory/client
 */
export interface IClient {
    /**
     * クライアントID
     *
     * @type {string}
     * @memberof IClient
     */
    id: string;
    /**
     * クライアントシークレット
     * クライアントのパスポートをトークン化する際に使用
     * また、このシークレットをクライアントに共有することで、クライアントがトークンを検証できるようにする
     * クライアント側で管理を徹底することが前提
     *
     * @type {string}
     * @memberof IClient
     */
    secret: string;
    /**
     * パスポート発行者の勤務シフト時間(秒)
     *
     * @type {number}
     * @memberof IClient
     */
    passport_issuer_work_shift_in_sesonds: number;
    /**
     * 発行者ひとりあたりのパスポート発行可能数
     *
     * @type {number}
     * @memberof IClient
     */
    total_number_of_passports_per_issuer: number;
}
