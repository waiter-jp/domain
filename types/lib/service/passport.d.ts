import CounterMongoDBAdapter from '../adapter/mongoDB/counter';
import CounterRedisAdapter from '../adapter/redis/counter';
import CounterSqlServerAdapter from '../adapter/sqlServer/counter';
import * as passportFactory from '../factory/passport';
export declare function issueWithMongo(clientId: string, scope: string): (counterMongoDBAdapter: CounterMongoDBAdapter) => Promise<string | null>;
export declare function issueWithRedis(clientId: string, scope: string): (counterRedisAdapter: CounterRedisAdapter) => Promise<string | null>;
export declare function issueWithSqlServer(clientId: string, scope: string): (counterSqlServerAdapter: CounterSqlServerAdapter) => Promise<string | null>;
/**
 * トークンを生成する
 *
 * @param {IPassport} passport スコープ
 * @returns {Promise<string>}
 */
export declare function createToken(passport: passportFactory.IPassport): Promise<string>;
