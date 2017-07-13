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
const passportFactory = require("../factory/passport");
const debug = createDebug('waiter-domain:service:passport');
function issueWithMongo(client, scope) {
    return (requestCounterMongoDBAdapter) => __awaiter(this, void 0, void 0, function* () {
        // クライアントに所属の発行者を呼び出し
        const issuer = createIssuer(client);
        // tslint:disable-next-line:no-magic-numbers
        const workShiftInSeconds = parseInt(client.passport_issuer_work_shift_in_sesonds.toString(), 10);
        // DBで発行リクエストカウントをとる
        const record = yield requestCounterMongoDBAdapter.requestCounterModel.findOneAndUpdate({
            issuer: issuer,
            scope: scope
        }, { $inc: { number_of_requests: +1 } }, {
            new: true,
            upsert: true
        }).lean().exec();
        debug('record:', record);
        // リクエストカウントが発行可能数を超えていなければ、暗号化して返却
        if (record.number_of_requests > client.total_number_of_passports_per_issuer) {
            return null;
        }
        else {
            const passport = passportFactory.create({
                client: client.id,
                scope: scope,
                issuer: issuer,
                issued_place: record.number_of_requests
            });
            return yield encode(passport, client.secret, workShiftInSeconds);
        }
    });
}
exports.issueWithMongo = issueWithMongo;
function issueWithRedis(client, scope) {
    return (counterRedisAdapter) => __awaiter(this, void 0, void 0, function* () {
        const issuer = createIssuer(client);
        // tslint:disable-next-line:no-magic-numbers
        const workShiftInSeconds = parseInt(client.passport_issuer_work_shift_in_sesonds.toString(), 10);
        const redisKey = `${issuer}:${scope}`;
        const ttl = workShiftInSeconds;
        return new Promise((resolve, reject) => {
            const multi = counterRedisAdapter.redisClient.multi();
            multi.incr(redisKey, debug)
                .expire(redisKey, ttl, debug)
                .exec((execErr, replies) => __awaiter(this, void 0, void 0, function* () {
                if (execErr instanceof Error) {
                    reject(execErr);
                    return;
                }
                debug('replies:', replies);
                const numberOfPassportsIssued = replies[0];
                if (numberOfPassportsIssued > client.total_number_of_passports_per_issuer) {
                    resolve(null);
                }
                else {
                    const passport = passportFactory.create({
                        client: client.id,
                        scope: scope,
                        issuer: issuer,
                        issued_place: numberOfPassportsIssued
                    });
                    const token = yield encode(passport, client.secret, workShiftInSeconds);
                    resolve(token);
                }
            }));
        });
    });
}
exports.issueWithRedis = issueWithRedis;
function issueWithSqlServer(client, scope) {
    return (counterSqlServerAdapter) => __awaiter(this, void 0, void 0, function* () {
        const issuer = createIssuer(client);
        // tslint:disable-next-line:no-magic-numbers
        const workShiftInSeconds = parseInt(client.passport_issuer_work_shift_in_sesonds.toString(), 10);
        const result = yield counterSqlServerAdapter.connectionPool.query `
MERGE INTO counters AS A
    USING (SELECT ${issuer} AS unit) AS B
    ON (A.unit = B.unit)
    WHEN MATCHED THEN
        UPDATE SET count = count + 1
    WHEN NOT MATCHED THEN
        INSERT (unit, count) VALUES (${issuer}, '1');
SELECT count FROM counters WHERE unit = ${issuer};
`;
        debug('result', result);
        // tslint:disable-next-line:no-magic-numbers
        const numberOfPassportsIssued = parseInt(result.recordset[0].count, 10);
        debug('numberOfPassportsIssued', numberOfPassportsIssued);
        if (numberOfPassportsIssued > client.total_number_of_passports_per_issuer) {
            return null;
        }
        else {
            const passport = passportFactory.create({
                client: client.id,
                scope: scope,
                issuer: issuer,
                issued_place: numberOfPassportsIssued
            });
            return yield encode(passport, client.secret, workShiftInSeconds);
        }
    });
}
exports.issueWithSqlServer = issueWithSqlServer;
/**
 * 発行者を作成する
 *
 * @param {string} clinetId クライアントID
 * @returns {string}
 */
function createIssuer(client) {
    const dateNow = moment();
    // tslint:disable-next-line:no-magic-numbers
    const workShiftInSeconds = parseInt(client.passport_issuer_work_shift_in_sesonds.toString(), 10);
    return `${client.id}:${(dateNow.unix() - dateNow.unix() % workShiftInSeconds).toString()}`;
}
/**
 * 許可証を暗号化する
 *
 * @param {IPassport} passport 許可証
 * @returns {Promise<string>}
 */
function encode(passport, secret, expiresIn) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            jwt.sign(passport, secret, {
                expiresIn: expiresIn
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
/**
 * 暗号化された許可証を検証する
 *
 * @param {string} encodedPassport
 * @param {string} secret
 * @returns {Promise<passportFactory.IPassport>}
 */
function verify(encodedPassport, secret) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            jwt.verify(encodedPassport, secret, (err, decoded) => {
                if (err instanceof Error) {
                    reject(err);
                }
                else {
                    const passport = passportFactory.create(decoded);
                    resolve(passport);
                }
            });
        });
    });
}
exports.verify = verify;
