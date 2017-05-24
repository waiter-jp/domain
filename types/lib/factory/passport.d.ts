/**
 * 許可証ファクトリー
 *
 * @namespace factory/passport
 */
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
    client_id: string;
    /**
     * 許可証のスコープ
     * クライアントが設定&管理する想定
     *
     * @type {string}
     * @memberof IPassport
     */
    scope: string;
}
