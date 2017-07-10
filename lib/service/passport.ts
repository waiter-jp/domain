/**
 * 許可証サービス
 *
 * @namespace service/passport
 */

import * as createDebug from 'debug';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';

import RequestCounterMongoDBAdapter from '../adapter/mongoDB/requestCounter';
import CounterRedisAdapter from '../adapter/redis/counter';
import CounterSqlServerAdapter from '../adapter/sqlServer/counter';
import * as clientFactory from '../factory/client';
import * as passportFactory from '../factory/passport';

const debug = createDebug('waiter-domain:service:passport');

export function issueWithMongo(client: clientFactory.IClient, scope: string) {
    return async (requestCounterMongoDBAdapter: RequestCounterMongoDBAdapter): Promise<string | null> => {
        // クライアントに所属の発行者を呼び出し
        const issuer = createIssuer(client);

        // DBで発行リクエストカウントをとる
        const record = <any>await requestCounterMongoDBAdapter.requestCounterModel.findOneAndUpdate(
            {
                issuer: issuer,
                scope: scope
            },
            { $inc: { number_of_requests: +1 } },
            {
                new: true,
                upsert: true
            }
        ).lean().exec();
        debug('record:', record);

        // リクエストカウントが発行可能数を超えていなければ、暗号化して返却
        if (record.number_of_requests > client.total_number_of_passports_per_issuer) {
            return null;
        } else {
            const passport = passportFactory.create({
                client: client.id,
                scope: scope,
                issuer: issuer,
                issued_place: record.number_of_requests
            });

            return await encode(passport, client.secret, client.passport_issuer_work_shift_in_sesonds);
        }
    };
}

export function issueWithRedis(client: clientFactory.IClient, scope: string) {
    return async (counterRedisAdapter: CounterRedisAdapter): Promise<string | null> => {
        const issuer = createIssuer(client);
        const redisKey = `${issuer}:${scope}`;
        const ttl = client.passport_issuer_work_shift_in_sesonds;

        return new Promise<string | null>((resolve, reject) => {
            const multi = counterRedisAdapter.redisClient.multi();
            multi.incr(redisKey, debug)
                .expire(redisKey, ttl, debug)
                .exec(async (execErr, replies) => {
                    if (execErr instanceof Error) {
                        reject(execErr);

                        return;
                    }

                    debug('replies:', replies);

                    const numberOfPassportsIssued = replies[0];
                    if (numberOfPassportsIssued > client.total_number_of_passports_per_issuer) {
                        resolve(null);
                    } else {
                        const passport = passportFactory.create({
                            client: client.id,
                            scope: scope,
                            issuer: issuer,
                            issued_place: numberOfPassportsIssued
                        });
                        const token = await encode(passport, client.secret, client.passport_issuer_work_shift_in_sesonds);

                        resolve(token);
                    }
                });
        });
    };
}

export function issueWithSqlServer(client: clientFactory.IClient, scope: string) {
    return async (counterSqlServerAdapter: CounterSqlServerAdapter): Promise<string | null> => {
        const issuer = createIssuer(client);
        const result = await counterSqlServerAdapter.connectionPool.query`
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
        } else {
            const passport = passportFactory.create({
                client: client.id,
                scope: scope,
                issuer: issuer,
                issued_place: numberOfPassportsIssued
            });

            return await encode(passport, client.secret, client.passport_issuer_work_shift_in_sesonds);
        }
    };
}

/**
 * 発行者を作成する
 *
 * @param {string} clinetId クライアントID
 * @returns {string}
 */
function createIssuer(client: clientFactory.IClient) {
    const dateNow = moment();

    return `${client.id}:${(dateNow.unix() - dateNow.unix() % client.passport_issuer_work_shift_in_sesonds).toString()}`;
}

/**
 * 許可証を暗号化する
 *
 * @param {IPassport} passport 許可証
 * @returns {Promise<string>}
 */
async function encode(passport: passportFactory.IPassport, secret: string, expiresIn: number) {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(
            passport,
            secret,
            {
                expiresIn: expiresIn
            },
            (err, encoded) => {
                if (err instanceof Error) {
                    reject(err);
                } else {
                    resolve(encoded);
                }
            }
        );
    });
}

/**
 * 暗号化された許可証を検証する
 *
 * @param {string} encodedPassport
 * @param {string} secret
 * @returns {Promise<passportFactory.IPassport>}
 */
export async function verify(encodedPassport: string, secret: string): Promise<passportFactory.IPassport> {
    return new Promise<passportFactory.IPassport>((resolve, reject) => {
        jwt.verify(encodedPassport, secret, (err, decoded) => {
            if (err instanceof Error) {
                reject(err);
            } else {
                const passport = passportFactory.create(<any>decoded);
                resolve(passport);
            }
        });
    });
}
