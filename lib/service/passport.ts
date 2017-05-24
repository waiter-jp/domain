/**
 * 許可証サービス
 *
 * @namespace service/passport
 */

import * as createDebug from 'debug';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';

import CounterMongoDBAdapter from '../adapter/mongoDB/counter';
import CounterRedisAdapter from '../adapter/redis/counter';
import CounterSqlServerAdapter from '../adapter/sqlServer/counter';
import * as passportFactory from '../factory/passport';

const debug = createDebug('waiter-prototype:controller:passports');

export function issueWithMongo(clientId: string, scope: string) {
    return async (counterMongoDBAdapter: CounterMongoDBAdapter): Promise<string | null> => {
        const key = createKey(scope);
        const counter = <any>await counterMongoDBAdapter.counterModel.findOneAndUpdate(
            { key: key },
            { $inc: { count: +1 } },
            {
                new: true,
                upsert: true
            }
        ).lean().exec();
        debug('counter:', counter);

        if (counter.count > Number(process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT)) {
            return null;
        } else {
            return await createToken({
                client_id: clientId,
                scope: scope
            });
        }
    };
}

export function issueWithRedis(clientId: string, scope: string) {
    return async (counterRedisAdapter: CounterRedisAdapter): Promise<string | null> => {
        const key = createKey(scope);
        const ttl = Number(process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS);

        return new Promise<string | null>((resolve, reject) => {
            const multi = counterRedisAdapter.redisClient.multi();
            multi.incr(key, debug)
                .expire(key, ttl, debug)
                .exec(async (execErr, replies) => {
                    if (execErr instanceof Error) {
                        reject(execErr);

                        return;
                    }

                    debug('replies:', replies);

                    const count = replies[0];
                    if (count > Number(process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT)) {
                        resolve(null);
                    } else {
                        const token = await createToken({
                            client_id: clientId,
                            scope: scope
                        });

                        resolve(token);
                    }
                });
        });
    };
}

export function issueWithSqlServer(clientId: string, scope: string) {
    return async (counterSqlServerAdapter: CounterSqlServerAdapter): Promise<string | null> => {
        const key = createKey(scope);
        const result = await counterSqlServerAdapter.connectionPool.query`
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
        } else {
            return await createToken({
                client_id: clientId,
                scope: scope
            });
        }
    };
}

/**
 * カウント単位キーを作成する
 *
 * @param {string} scope カウント単位スコープ
 * @returns {string}
 */
function createKey(scope: string) {
    const dateNow = moment();

    return `${scope}:${(dateNow.unix() - dateNow.unix() % Number(process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS)).toString()}`;
}

/**
 * トークンを生成する
 *
 * @param {IPassport} passport スコープ
 * @returns {Promise<string>}
 */
export async function createToken(passport: passportFactory.IPassport) {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(
            passport,
            process.env.WAITER_SECRET,
            {
                expiresIn: Number(process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS)
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
