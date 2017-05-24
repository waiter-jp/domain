/**
 * sql serverクライアント
 *
 * @module
 */
import * as mssql from 'mssql';
declare const _default: () => Promise<mssql.ConnectionPool>;
export default _default;
