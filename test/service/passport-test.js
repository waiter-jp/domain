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
const counter_1 = require("../../lib/adapter/mongoDB/counter");
const counter_2 = require("../../lib/adapter/redis/counter");
const counter_3 = require("../../lib/adapter/sqlServer/counter");
const passportService = require("../../lib/service/passport");
const testClientId = 'motionpicture';
const testScope = 'testscope';
let connection;
let redisClient;
let sqlServerConnectionPool;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    redisClient = redis.createClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_KEY,
        return_buffers: false,
        tls: { servername: process.env.REDIS_HOST }
    });
    sqlServerConnectionPool = yield (new mssql.ConnectionPool({
        user: process.env.SQL_SERVER_USERNAME,
        password: process.env.SQL_SERVER_PASSWORD,
        server: process.env.SQL_SERVER_SERVER,
        database: process.env.SQL_SERVER_DATABASE,
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
        const counterMongoDBAdapter = new counter_1.default(connection);
        const token = yield passportService.issueWithMongo(testClientId, testScope)(counterMongoDBAdapter);
        assert.equal(typeof token, 'string');
    }));
    it('発行数が上限に達していればnull', () => __awaiter(this, void 0, void 0, function* () {
        process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT = 0;
        const counterMongoDBAdapter = new counter_1.default(connection);
        const token = yield passportService.issueWithMongo(testClientId, testScope)(counterMongoDBAdapter);
        assert.equal(token, null);
    }));
});
describe('redisで発行する', () => {
    beforeEach(() => {
        resetEnvironmentVariables();
    });
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const counterRedisAdapter = new counter_2.default(redisClient);
        const token = yield passportService.issueWithRedis(testClientId, testScope)(counterRedisAdapter);
        assert.equal(typeof token, 'string');
    }));
    it('発行数が上限に達していればnull', () => __awaiter(this, void 0, void 0, function* () {
        process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT = 0;
        const counterRedisAdapter = new counter_2.default(redisClient);
        const token = yield passportService.issueWithRedis(testClientId, testScope)(counterRedisAdapter);
        assert.equal(token, null);
    }));
});
describe('sql serverで発行する', () => {
    beforeEach(() => {
        resetEnvironmentVariables();
    });
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const counterSqlServerAdapter = new counter_3.default(sqlServerConnectionPool);
        const token = yield passportService.issueWithSqlServer(testClientId, testScope)(counterSqlServerAdapter);
        assert.equal(typeof token, 'string');
    }));
    it('発行数が上限に達していればnull', () => __awaiter(this, void 0, void 0, function* () {
        process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT = 0;
        const counterSqlServerAdapter = new counter_3.default(sqlServerConnectionPool);
        const token = yield passportService.issueWithSqlServer(testClientId, testScope)(counterSqlServerAdapter);
        assert.equal(token, null);
    }));
});
function resetEnvironmentVariables() {
    // tslint:disable-next-line:no-magic-numbers
    process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS = 60;
    // tslint:disable-next-line:no-magic-numbers
    process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT = 10;
}
