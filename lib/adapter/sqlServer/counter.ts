import * as mssql from 'mssql';

/**
 * カウンターsql serverアダプター
 *
 * @class CounterSqlServerAdapter
 */
export default class CounterSqlServerAdapter {
    public readonly connectionPool: mssql.ConnectionPool;

    constructor(connectionPool: mssql.ConnectionPool) {
        this.connectionPool = connectionPool;
    }
}
