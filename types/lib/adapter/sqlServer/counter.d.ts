import * as mssql from 'mssql';
/**
 * カウンターsql serverアダプター
 *
 * @class CounterSqlServerAdapter
 */
export default class CounterSqlServerAdapter {
    readonly connectionPool: mssql.ConnectionPool;
    constructor(connectionPool: mssql.ConnectionPool);
}
