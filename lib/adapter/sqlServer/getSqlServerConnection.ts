/**
 * sql serverクライアント
 *
 * @module
 */

import * as mssql from 'mssql';

let pool: mssql.ConnectionPool;

export default async () => {
    if (pool === undefined) {
        pool = await (new mssql.ConnectionPool({
            user: process.env.SQL_SERVER_USERNAME,
            password: process.env.SQL_SERVER_PASSWORD,
            server: process.env.SQL_SERVER_SERVER,
            database: process.env.SQL_SERVER_DATABASE,
            options: {
                encrypt: true // Use this if you're on Windows Azure
            }
        })).connect();
    }

    return pool;
};
