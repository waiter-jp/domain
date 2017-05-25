/// <reference types="mongoose" />
/**
 * waiter-domainモジュール
 *
 * @module
 */
import { Connection } from 'mongoose';
import { ConnectionPool } from 'mssql';
import { RedisClient } from 'redis';
import * as passportService from './service/passport';
import RequestCounterMongoDBAdapter from './adapter/mongoDB/requestCounter';
import CounterRedisAdapter from './adapter/redis/counter';
import CounterSqlServerAdapter from './adapter/sqlServer/counter';
import * as passportFactory from './factory/passport';
export declare const adapter: {
    mongoDB: {
        requestCounter: (connection: Connection) => RequestCounterMongoDBAdapter;
    };
    redis: {
        counter: (redisClient: RedisClient) => CounterRedisAdapter;
    };
    sqlServer: {
        counter: (connectionPool: ConnectionPool) => CounterSqlServerAdapter;
    };
};
export declare const service: {
    passport: typeof passportService;
};
export declare const factory: {
    passport: typeof passportFactory;
};
