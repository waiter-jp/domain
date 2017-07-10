"use strict";
/**
 * waiter-domainモジュール
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const mssql = require("mssql");
const nodeRedis = require("redis");
const PassportService = require("./service/passport");
const requestCounter_1 = require("./adapter/mongoDB/requestCounter");
const counter_1 = require("./adapter/redis/counter");
const counter_2 = require("./adapter/sqlServer/counter");
const PassportFactory = require("./factory/passport");
const errorCode_1 = require("./errorCode");
mongoose.Promise = global.Promise;
/**
 * MongoDBクライアント`mongoose`
 *
 * @example
 * var promise = waiter.mongoose.connect('mongodb://localhost/myapp', {
 *     useMongoClient: true
 * });
 */
exports.mongoose = mongoose;
/**
 * SQLServerクライアント
 */
exports.mssql = mssql;
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
exports.redis = nodeRedis;
var adapter;
(function (adapter) {
    let mongoDB;
    (function (mongoDB) {
        function requestCounter(connection) {
            return new requestCounter_1.default(connection);
        }
        mongoDB.requestCounter = requestCounter;
    })(mongoDB = adapter.mongoDB || (adapter.mongoDB = {}));
    // tslint:disable-next-line:no-shadowed-variable
    let redis;
    (function (redis) {
        function counter(redisClient) {
            return new counter_1.default(redisClient);
        }
        redis.counter = counter;
    })(redis = adapter.redis || (adapter.redis = {}));
    let sqlServer;
    (function (sqlServer) {
        function counter(connectionPool) {
            return new counter_2.default(connectionPool);
        }
        sqlServer.counter = counter;
    })(sqlServer = adapter.sqlServer || (adapter.sqlServer = {}));
})(adapter = exports.adapter || (exports.adapter = {}));
var service;
(function (service) {
    service.passport = PassportService;
})(service = exports.service || (exports.service = {}));
var factory;
(function (factory) {
    factory.passport = PassportFactory;
})(factory = exports.factory || (exports.factory = {}));
exports.errorCode = errorCode_1.default;
