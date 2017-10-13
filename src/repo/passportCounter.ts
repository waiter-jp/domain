import * as createDebug from 'debug';
import * as moment from 'moment';
import * as redis from 'redis';

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
    public readonly redisClient: redis.RedisClient;

    constructor(redisClient: redis.RedisClient) {
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

    public async incr(client: clientFactory.IClient, scope: string) {
        return new Promise<IIncrementResult>((resolve, reject) => {
            const issuer = RedisRepository.CREATE_ISSUER(client);
            // tslint:disable-next-line:no-magic-numbers
            const workShiftInSeconds = parseInt(client.passportIssuerWorkShiftInSesonds.toString(), 10);
            const redisKey = `${issuer}:${scope}`;
            const ttl = workShiftInSeconds;

            const multi = this.redisClient.multi();
            debug('redis multi client created.', multi);
            multi.incr(redisKey, debug)
                .expire(redisKey, ttl, debug)
                .exec((execErr, replies) => {
                    if (execErr instanceof Error) {
                        reject(execErr);
                    } else {
                        debug('replies:', replies);
                        resolve({
                            issuer: issuer,
                            // tslint:disable-next-line:no-magic-numbers
                            issuedPlace: parseInt(replies[0], 10)
                        });
                    }
                });
        });
    }
}
