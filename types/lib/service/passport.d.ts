import RequestCounterMongoDBAdapter from '../adapter/mongoDB/requestCounter';
import CounterRedisAdapter from '../adapter/redis/counter';
import CounterSqlServerAdapter from '../adapter/sqlServer/counter';
import * as clientFactory from '../factory/client';
import * as passportFactory from '../factory/passport';
export declare function issueWithMongo(client: clientFactory.IClient, scope: string): (requestCounterMongoDBAdapter: RequestCounterMongoDBAdapter) => Promise<string | null>;
export declare function issueWithRedis(client: clientFactory.IClient, scope: string): (counterRedisAdapter: CounterRedisAdapter) => Promise<string | null>;
export declare function issueWithSqlServer(client: clientFactory.IClient, scope: string): (counterSqlServerAdapter: CounterSqlServerAdapter) => Promise<string | null>;
/**
 * 暗号化された許可証を検証する
 *
 * @param {string} encodedPassport
 * @param {string} secret
 * @returns {Promise<passportFactory.IPassport>}
 */
export declare function verify(encodedPassport: string, secret: string): Promise<passportFactory.IPassport>;
