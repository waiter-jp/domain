"use strict";
/**
 * パスポートサービステスト
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const mongoose = require("mongoose");
const mssql = require("mssql");
const redis = require("redis");
const requestCounter_1 = require("../../lib/adapter/mongoDB/requestCounter");
const counter_1 = require("../../lib/adapter/redis/counter");
const counter_2 = require("../../lib/adapter/sqlServer/counter");
const passportService = require("../../lib/service/passport");
const testClient = {
    id: 'motionpicture',
    secret: 'motionpicture',
    passport_issuer_work_shift_in_sesonds: 60,
    total_number_of_passports_per_issuer: 10
};
const testScope = 'testscope';
let connection;
let redisClient;
let sqlServerConnectionPool;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.TEST_MONGOLAB_URI);
    redisClient = redis.createClient({
        host: process.env.TEST_REDIS_HOST,
        port: process.env.TEST_REDIS_PORT,
        password: process.env.TEST_REDIS_KEY,
        return_buffers: false,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });
    sqlServerConnectionPool = yield (new mssql.ConnectionPool({
        user: process.env.TEST_SQL_SERVER_USERNAME,
        password: process.env.TEST_SQL_SERVER_PASSWORD,
        server: process.env.TEST_SQL_SERVER_SERVER,
        database: process.env.TEST_SQL_SERVER_DATABASE,
        options: {
            encrypt: true // Use this if you're on Windows Azure
        }
    })).connect();
}));
describe('mongodbで発行する', () => {
    beforeEach(() => {
        resetEnvironmentVariables();
    });
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const requestCounterMongoDBAdapter = new requestCounter_1.default(connection);
        const token = yield passportService.issueWithMongo(testClient, testScope)(requestCounterMongoDBAdapter);
        assert.equal(typeof token, 'string');
    }));
    it('発行数が上限に達していればnull', () => __awaiter(this, void 0, void 0, function* () {
        testClient.total_number_of_passports_per_issuer = 0;
        const requestCounterMongoDBAdapter = new requestCounter_1.default(connection);
        const token = yield passportService.issueWithMongo(testClient, testScope)(requestCounterMongoDBAdapter);
        assert.equal(token, null);
    }));
});
describe('redisで発行する', () => {
    beforeEach(() => {
        resetEnvironmentVariables();
    });
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const counterRedisAdapter = new counter_1.default(redisClient);
        const token = yield passportService.issueWithRedis(testClient, testScope)(counterRedisAdapter);
        assert.equal(typeof token, 'string');
    }));
    it('発行数が上限に達していればnull', () => __awaiter(this, void 0, void 0, function* () {
        testClient.total_number_of_passports_per_issuer = 0;
        const counterRedisAdapter = new counter_1.default(redisClient);
        const token = yield passportService.issueWithRedis(testClient, testScope)(counterRedisAdapter);
        assert.equal(token, null);
    }));
});
describe('sql serverで発行する', () => {
    beforeEach(() => {
        resetEnvironmentVariables();
    });
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const counterSqlServerAdapter = new counter_2.default(sqlServerConnectionPool);
        const token = yield passportService.issueWithSqlServer(testClient, testScope)(counterSqlServerAdapter);
        assert.equal(typeof token, 'string');
    }));
    it('発行数が上限に達していればnull', () => __awaiter(this, void 0, void 0, function* () {
        testClient.total_number_of_passports_per_issuer = 0;
        const counterSqlServerAdapter = new counter_2.default(sqlServerConnectionPool);
        const token = yield passportService.issueWithSqlServer(testClient, testScope)(counterSqlServerAdapter);
        assert.equal(token, null);
    }));
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
    it('適切に発行された許可証であれば検証成功', () => __awaiter(this, void 0, void 0, function* () {
        const counterSqlServerAdapter = new counter_2.default(sqlServerConnectionPool);
        const token = yield passportService.issueWithSqlServer(testClient, testScope)(counterSqlServerAdapter);
        assert.equal(typeof token, 'string');
        const passport = yield passportService.verify(token, testClient.secret);
        assert.equal(passport.client, testClient.id);
        assert.equal(passport.scope, testScope);
    }));
    it('シークレットが間違っていれば失敗', () => __awaiter(this, void 0, void 0, function* () {
        const counterSqlServerAdapter = new counter_2.default(sqlServerConnectionPool);
        const token = yield passportService.issueWithSqlServer(testClient, testScope)(counterSqlServerAdapter);
        assert.equal(typeof token, 'string');
        let verifyError;
        try {
            yield passportService.verify(token, 'invalidsecret');
        }
        catch (error) {
            verifyError = error;
        }
        assert(verifyError instanceof Error);
    }));
});
