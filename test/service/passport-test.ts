/**
 * パスポートサービステスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as mongoose from 'mongoose';
import * as mssql from 'mssql';
import * as redis from 'redis';

import CounterMongoDBAdapter from '../../lib/adapter/mongoDB/counter';
import CounterRedisAdapter from '../../lib/adapter/redis/counter';
import CounterSqlServerAdapter from '../../lib/adapter/sqlServer/counter';
import * as passportService from '../../lib/service/passport';

const testClientId = 'motionpicture';
const testScope = 'testscope';
let connection: mongoose.Connection;
let redisClient: redis.RedisClient;
let sqlServerConnectionPool: mssql.ConnectionPool;

before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    redisClient = redis.createClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_KEY,
        return_buffers: false,
        tls: { servername: process.env.REDIS_HOST }
    });

    sqlServerConnectionPool = await (new mssql.ConnectionPool({
        user: process.env.SQL_SERVER_USERNAME,
        password: process.env.SQL_SERVER_PASSWORD,
        server: process.env.SQL_SERVER_SERVER,
        database: process.env.SQL_SERVER_DATABASE,
        options: {
            encrypt: true // Use this if you're on Windows Azure
        }
    })).connect();
});

describe('mongodbで発行する', () => {
    beforeEach(() => {
        resetEnvironmentVariables();
    });

    it('ok', async () => {
        const counterMongoDBAdapter = new CounterMongoDBAdapter(connection);
        const token = await passportService.issueWithMongo(testClientId, testScope)(counterMongoDBAdapter);
        assert.equal(typeof token, 'string');
    });

    it('発行数が上限に達していればnull', async () => {
        process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT = 0;
        const counterMongoDBAdapter = new CounterMongoDBAdapter(connection);
        const token = await passportService.issueWithMongo(testClientId, testScope)(counterMongoDBAdapter);
        assert.equal(token, null);
    });
});

describe('redisで発行する', () => {
    beforeEach(() => {
        resetEnvironmentVariables();
    });

    it('ok', async () => {
        const counterRedisAdapter = new CounterRedisAdapter(redisClient);
        const token = await passportService.issueWithRedis(testClientId, testScope)(counterRedisAdapter);
        assert.equal(typeof token, 'string');
    });

    it('発行数が上限に達していればnull', async () => {
        process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT = 0;
        const counterRedisAdapter = new CounterRedisAdapter(redisClient);
        const token = await passportService.issueWithRedis(testClientId, testScope)(counterRedisAdapter);
        assert.equal(token, null);
    });
});

describe('sql serverで発行する', () => {
    beforeEach(() => {
        resetEnvironmentVariables();
    });

    it('ok', async () => {
        const counterSqlServerAdapter = new CounterSqlServerAdapter(sqlServerConnectionPool);
        const token = await passportService.issueWithSqlServer(testClientId, testScope)(counterSqlServerAdapter);
        assert.equal(typeof token, 'string');
    });

    it('発行数が上限に達していればnull', async () => {
        process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT = 0;
        const counterSqlServerAdapter = new CounterSqlServerAdapter(sqlServerConnectionPool);
        const token = await passportService.issueWithSqlServer(testClientId, testScope)(counterSqlServerAdapter);
        assert.equal(token, null);
    });
});

function resetEnvironmentVariables() {
    // tslint:disable-next-line:no-magic-numbers
    process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS = 60;
    // tslint:disable-next-line:no-magic-numbers
    process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT = 10;
}
