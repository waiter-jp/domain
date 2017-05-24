"use strict";
/**
 * waiter-domainモジュール
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
const passportService = require("./service/passport");
const counter_1 = require("./adapter/mongoDB/counter");
const counter_2 = require("./adapter/redis/counter");
const counter_3 = require("./adapter/sqlServer/counter");
const passportFactory = require("./factory/passport");
exports.adapter = {
    mongoDB: {
        counter: (connection) => {
            return new counter_1.default(connection);
        }
    },
    redis: {
        counter: (redisClient) => {
            return new counter_2.default(redisClient);
        }
    },
    sqlServer: {
        counter: (connectionPool) => {
            return new counter_3.default(connectionPool);
        }
    }
};
exports.service = {
    passport: passportService
};
exports.factory = {
    passport: passportFactory
};
