/**
 * パスポートサービステスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as mongoose from 'mongoose';
import * as mssql from 'mssql';
import * as redis from 'redis';

import RequestCounterMongoDBAdapter from '../../lib/adapter/mongoDB/requestCounter';
import CounterRedisAdapter from '../../lib/adapter/redis/counter';
import CounterSqlServerAdapter from '../../lib/adapter/sqlServer/counter';
import * as passportService from '../../lib/service/passport';

const testClient = {
    id: 'motionpicture',
    secret: 'motionpicture',
    passport_issuer_work_shift_in_sesonds: 60,
    total_number_of_passports_per_issuer: 10
};
const testScope = 'testscope';
let connection: mongoose.Connection;
let redisClient: redis.RedisClient;
let sqlServerConnectionPool: mssql.ConnectionPool;

before(async () => {
    connection = mongoose.createConnection(process.env.TEST_MONGOLAB_URI);

    redisClient = redis.createClient({
        host: process.env.TEST_REDIS_HOST,
        port: process.env.TEST_REDIS_PORT,
        password: process.env.TEST_REDIS_KEY,
        return_buffers: false,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });

    sqlServerConnectionPool = await (new mssql.ConnectionPool({
        user: process.env.TEST_SQL_SERVER_USERNAME,
        password: process.env.TEST_SQL_SERVER_PASSWORD,
        server: process.env.TEST_SQL_SERVER_SERVER,
        database: process.env.TEST_SQL_SERVER_DATABASE,
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
        const requestCounterMongoDBAdapter = new RequestCounterMongoDBAdapter(connection);
        const token = await passportService.issueWithMongo(testClient, testScope)(requestCounterMongoDBAdapter);
        assert.equal(typeof token, 'string');
    });

    it('発行数が上限に達していればnull', async () => {
        testClient.total_number_of_passports_per_issuer = 0;
        const requestCounterMongoDBAdapter = new RequestCounterMongoDBAdapter(connection);
        const token = await passportService.issueWithMongo(testClient, testScope)(requestCounterMongoDBAdapter);
        assert.equal(token, null);
    });
});

describe('redisで発行する', () => {
    beforeEach(() => {
        resetEnvironmentVariables();
    });

    it('ok', async () => {
        const counterRedisAdapter = new CounterRedisAdapter(redisClient);
        const token = await passportService.issueWithRedis(testClient, testScope)(counterRedisAdapter);
        assert.equal(typeof token, 'string');
    });

    it('発行数が上限に達していればnull', async () => {
        testClient.total_number_of_passports_per_issuer = 0;
        const counterRedisAdapter = new CounterRedisAdapter(redisClient);
        const token = await passportService.issueWithRedis(testClient, testScope)(counterRedisAdapter);
        assert.equal(token, null);
    });
});

describe('sql serverで発行する', () => {
    beforeEach(() => {
        resetEnvironmentVariables();
    });

    it('ok', async () => {
        const counterSqlServerAdapter = new CounterSqlServerAdapter(sqlServerConnectionPool);
        const token = await passportService.issueWithSqlServer(testClient, testScope)(counterSqlServerAdapter);
        assert.equal(typeof token, 'string');
    });

    it('発行数が上限に達していればnull', async () => {
        testClient.total_number_of_passports_per_issuer = 0;
        const counterSqlServerAdapter = new CounterSqlServerAdapter(sqlServerConnectionPool);
        const token = await passportService.issueWithSqlServer(testClient, testScope)(counterSqlServerAdapter);
        assert.equal(token, null);
    });
});

function resetEnvironmentVariables() {
    // tslint:disable-next-line:no-magic-numbers
    testClient.passport_issuer_work_shift_in_sesonds = 60;
    // tslint:disable-next-line:no-magic-numbers
    testClient.total_number_of_passports_per_issuer = 10;
}

describe('トークンを検証する', () => {
    beforeEach(() => {
        resetEnvironmentVariables();
    });

    it('適切に発行された許可証であれば検証成功', async () => {
        const counterSqlServerAdapter = new CounterSqlServerAdapter(sqlServerConnectionPool);
        const token = await passportService.issueWithSqlServer(testClient, testScope)(counterSqlServerAdapter);
        assert.equal(typeof token, 'string');

        const passport = await passportService.verify(<string>token, testClient.secret);
        assert.equal(passport.client, testClient.id);
        assert.equal(passport.scope, testScope);
    });

    it('シークレットが間違っていれば失敗', async () => {
        const counterSqlServerAdapter = new CounterSqlServerAdapter(sqlServerConnectionPool);
        const token = await passportService.issueWithSqlServer(testClient, testScope)(counterSqlServerAdapter);
        assert.equal(typeof token, 'string');

        let verifyError: any;
        try {
            await passportService.verify(<string>token, 'invalidsecret');
        } catch (error) {
            verifyError = error;
        }

        assert(verifyError instanceof Error);
    });
});
