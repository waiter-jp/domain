/**
 * waiter-domainモジュール
 *
 * @module
 */

import { Connection } from 'mongoose';
import { ConnectionPool } from 'mssql';
import { RedisClient } from 'redis';

import * as passportService from './service/passport';

import CounterMongoDBAdapter from './adapter/mongoDB/counter';
import CounterRedisAdapter from './adapter/redis/counter';
import CounterSqlServerAdapter from './adapter/sqlServer/counter';

import * as passportFactory from './factory/passport';

export const adapter = {
    mongoDB: {
        counter: (connection: Connection) => {
            return new CounterMongoDBAdapter(connection);
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
