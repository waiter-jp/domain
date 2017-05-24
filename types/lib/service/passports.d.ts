import CounterMongoDBAdapter from '../adapter/mongoDB/counter';
import * as passportFactory from '../factory/passport';
export declare function issueWithMongo(clientId: string, scope: string): (counterMongoDBAdapter: CounterMongoDBAdapter) => Promise<string | null>;
/**
 * トークンを生成する
 *
 * @param {IPassport} passport スコープ
 * @returns {Promise<string>}
 */
export declare function createToken(passport: passportFactory.IPassport): Promise<string>;
