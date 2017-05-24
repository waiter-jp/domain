"use strict";
/**
 * 許可証サービス
 *
 * @namespace service/passport
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
const createDebug = require("debug");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const debug = createDebug('waiter-domain:service:passport');
function issueWithMongo(clientId, scope) {
    return (counterMongoDBAdapter) => __awaiter(this, void 0, void 0, function* () {
        const key = createKey(scope);
        const counter = yield counterMongoDBAdapter.counterModel.findOneAndUpdate({ key: key }, { $inc: { count: +1 } }, {
            new: true,
            upsert: true
        }).lean().exec();
        debug('counter:', counter);
        if (counter.count > Number(process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT)) {
            return null;
        }
        else {
            return yield createToken({
                client_id: clientId,
                scope: scope
            });
        }
    });
}
exports.issueWithMongo = issueWithMongo;
function issueWithRedis(clientId, scope) {
    return (counterRedisAdapter) => __awaiter(this, void 0, void 0, function* () {
        const key = createKey(scope);
        const ttl = Number(process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS);
        return new Promise((resolve, reject) => {
            const multi = counterRedisAdapter.redisClient.multi();
            multi.incr(key, debug)
                .expire(key, ttl, debug)
                .exec((execErr, replies) => __awaiter(this, void 0, void 0, function* () {
                if (execErr instanceof Error) {
                    reject(execErr);
                    return;
                }
                debug('replies:', replies);
                const count = replies[0];
                if (count > Number(process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT)) {
                    resolve(null);
                }
                else {
                    const token = yield createToken({
                        client_id: clientId,
                        scope: scope
                    });
                    resolve(token);
                }
            }));
        });
    });
}
exports.issueWithRedis = issueWithRedis;
function issueWithSqlServer(clientId, scope) {
    return (counterSqlServerAdapter) => __awaiter(this, void 0, void 0, function* () {
        const key = createKey(scope);
        const result = yield counterSqlServerAdapter.connectionPool.query `
MERGE INTO counters AS A
    USING (SELECT ${key} AS unit) AS B
    ON (A.unit = B.unit)
    WHEN MATCHED THEN
        UPDATE SET count = count + 1
    WHEN NOT MATCHED THEN
        INSERT (unit, count) VALUES (${key}, '0');
SELECT count FROM counters WHERE unit = ${key};
`;
        debug('result', result);
        // tslint:disable-next-line:no-magic-numbers
        const nextCount = parseInt(result.recordset[0].count, 10);
        debug('nextCount', nextCount);
        if (nextCount > Number(process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT)) {
            return null;
        }
        else {
            return yield createToken({
                client_id: clientId,
                scope: scope
            });
        }
    });
}
exports.issueWithSqlServer = issueWithSqlServer;
/**
 * カウント単位キーを作成する
 *
 * @param {string} scope カウント単位スコープ
 * @returns {string}
 */
function createKey(scope) {
    const dateNow = moment();
    return `${scope}:${(dateNow.unix() - dateNow.unix() % Number(process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS)).toString()}`;
}
/**
 * トークンを生成する
 *
 * @param {IPassport} passport スコープ
 * @returns {Promise<string>}
 */
function createToken(passport) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            jwt.sign(passport, process.env.WAITER_SECRET, {
                expiresIn: Number(process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS)
            }, (err, encoded) => {
                if (err instanceof Error) {
                    reject(err);
                }
                else {
                    resolve(encoded);
                }
            });
        });
    });
}
exports.createToken = createToken;
