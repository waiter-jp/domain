/// <reference types="mongoose" />
/**
 * waiter-domainモジュール
 *
 * @module
 */
import * as mongoose from 'mongoose';
import * as mssql from 'mssql';
import * as nodeRedis from 'redis';
import * as PassportService from './service/passport';
import RequestCounterMongoDBAdapter from './adapter/mongoDB/requestCounter';
import CounterRedisAdapter from './adapter/redis/counter';
import CounterSqlServerAdapter from './adapter/sqlServer/counter';
import * as PassportFactory from './factory/passport';
import ErrorCode from './errorCode';
/**
 * MongoDBクライアント`mongoose`
 *
 * @example
 * var promise = waiter.mongoose.connect('mongodb://localhost/myapp', {
 *     useMongoClient: true
 * });
 */
export import mongoose = mongoose;
/**
 * SQLServerクライアント
 */
export import mssql = mssql;
/**
 * Redis Cacheクライアント
 *
 * @example
 * const client = waiter.redis.createClient({
 *      host: process.env.REDIS_HOST,
 *      port: process.env.REDIS_PORT,
 *      password: process.env.REDIS_KEY,
 *      tls: { servername: process.env.TEST_REDIS_HOST }
 * });
 */
export import redis = nodeRedis;
export declare namespace adapter {
    namespace mongoDB {
        function requestCounter(connection: mongoose.Connection): RequestCounterMongoDBAdapter;
    }
    namespace redis {
        function counter(redisClient: nodeRedis.RedisClient): CounterRedisAdapter;
    }
    namespace sqlServer {
        function counter(connectionPool: mssql.ConnectionPool): CounterSqlServerAdapter;
    }
}
export declare namespace service {
    export import passport = PassportService;
}
export declare namespace factory {
    export import passport = PassportFactory;
}
export import errorCode = ErrorCode;
