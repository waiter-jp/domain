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

export const adapter = {
    mongoDB: {
        requestCounter: (connection: Connection) => {
            return new RequestCounterMongoDBAdapter(connection);
        }
    },
    redis: {
        counter: (redisClient: RedisClient) => {
            return new CounterRedisAdapter(redisClient);
        }
    },
    sqlServer: {
        counter: (connectionPool: ConnectionPool) => {
            return new CounterSqlServerAdapter(connectionPool);
        }
    }
};

export const service = {
    passport: passportService
};

export const factory = {
    passport: passportFactory
};
