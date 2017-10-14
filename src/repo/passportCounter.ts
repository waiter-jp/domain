import * as createDebug from 'debug';
import * as redis from 'ioredis';
import * as moment from 'moment';

import * as clientFactory from '../factory/client';

const debug = createDebug('waiter-domain:repository:passportCounter');

export interface IIncrementResult {
    issuer: string;
    issuedPlace: number;
}

/**
 * 許可証カウンターRedisレポジトリー
 * @export
 * @class
 */
export class RedisRepository {
    public readonly redisClient: redis.Redis;

    constructor(redisClient: redis.Redis) {
        this.redisClient = redisClient;
    }

    /**
     * 発行者を作成する
     * @param {string} clinetId クライアントID
     * @returns {string}
     */
    public static CREATE_ISSUER(client: clientFactory.IClient) {
        const dateNow = moment();
        // tslint:disable-next-line:no-magic-numbers
        const workShiftInSeconds = parseInt(client.passportIssuerWorkShiftInSesonds.toString(), 10);

        return `${client.id}:${(dateNow.unix() - dateNow.unix() % workShiftInSeconds).toString()}`;
    }

    /**
     * クライアントとスコープ指定で許可証数をカウントアップする
     * @param client クライアント
     * @param scope スコープ
     */
    public async incr(client: clientFactory.IClient, scope: string): Promise<IIncrementResult> {
        const issuer = RedisRepository.CREATE_ISSUER(client);
        // tslint:disable-next-line:no-magic-numbers
        const workShiftInSeconds = parseInt(client.passportIssuerWorkShiftInSesonds.toString(), 10);
        const redisKey = `${issuer}:${scope}`;
        const ttl = workShiftInSeconds;

        const results = await this.redisClient.multi()
            .incr(redisKey, debug)
            .expire(redisKey, ttl, debug)
            .exec();
        debug('results:', results);

        return ({
            issuer: issuer,
            // tslint:disable-next-line:no-magic-numbers
            issuedPlace: parseInt(results[0][1], 10)
        });
    }

    /**
     * クライアントとスコープ指定で現在の許可証数を取得する
     * @param client クライアント
     * @param scope スコープ
     */
    public async now(client: clientFactory.IClient, scope: string): Promise<IIncrementResult> {
        const issuer = RedisRepository.CREATE_ISSUER(client);
        const redisKey = `${issuer}:${scope}`;

        const result = await this.redisClient.get(redisKey, debug);
        debug('result:', result);

        return ({
            issuer: issuer,
            // tslint:disable-next-line:no-magic-numbers
            issuedPlace: (result === null) ? 0 : parseInt(result, 10)
        });
    }
}
