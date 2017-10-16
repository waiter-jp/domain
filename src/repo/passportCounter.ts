import * as createDebug from 'debug';
import * as redis from 'ioredis';
import * as moment from 'moment';

import * as clientFactory from '../factory/client';

const debug = createDebug('waiter-domain:repository:passportCounter');

export interface IIncrementResult {
    issueUnitName: string;
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
     * 発行単位を作成する
     * @param {string} clinetId クライアントID
     * @returns {string}
     */
    public static CREATE_ISSUE_UNIT(client: clientFactory.IClient) {
        const dateNow = moment();
        // tslint:disable-next-line:no-magic-numbers
        const aggregationUnitInSeconds = parseInt(client.passportIssueRule.aggregationUnitInSeconds.toString(), 10);

        return `${client.id}:${(dateNow.unix() - dateNow.unix() % aggregationUnitInSeconds).toString()}`;
    }

    /**
     * クライアントとスコープ指定で許可証数をカウントアップする
     * @param client クライアント
     * @param scope スコープ
     */
    public async incr(client: clientFactory.IClient, scope: string): Promise<IIncrementResult> {
        const issueUnitName = RedisRepository.CREATE_ISSUE_UNIT(client);
        // tslint:disable-next-line:no-magic-numbers
        const workShiftInSeconds = parseInt(client.passportIssueRule.aggregationUnitInSeconds.toString(), 10);
        const redisKey = `${issueUnitName}:${scope}`;
        const ttl = workShiftInSeconds;

        const results = await this.redisClient.multi()
            .incr(redisKey, debug)
            .expire(redisKey, ttl, debug)
            .exec();
        debug('results:', results);

        return ({
            issueUnitName: issueUnitName,
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
        const issueUnitName = RedisRepository.CREATE_ISSUE_UNIT(client);
        const redisKey = `${issueUnitName}:${scope}`;

        const result = await this.redisClient.get(redisKey, debug);
        debug('result:', result);

        return ({
            issueUnitName: issueUnitName,
            // tslint:disable-next-line:no-magic-numbers
            issuedPlace: (result === null) ? 0 : parseInt(result, 10)
        });
    }
}
