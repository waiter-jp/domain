import * as createDebug from 'debug';
import * as redis from 'ioredis';
import * as moment from 'moment';

import * as ClientFactory from '../factory/client';
import { IIssueUnit } from '../factory/passport';

const debug = createDebug('waiter-domain:repository:passportIssueUnit');

/**
 * 許可証発行単位Redisレポジトリー
 * @export
 * @class
 */
export class RedisRepository {
    public readonly redisClient: redis.Redis;

    constructor(redisClient: redis.Redis) {
        this.redisClient = redisClient;
    }

    /**
     * 発行単位属性を作成する
     * @param {string} clinetId クライアントID
     * @param {string} scope スコープ
     * @returns {string}
     */
    public static CREATE_ISSUE_UNIT_PARAMS(client: ClientFactory.IClient, scope: string) {
        const dateNow = moment();
        // tslint:disable-next-line:no-magic-numbers
        const aggregationUnitInSeconds = parseInt(client.passportIssueRule.aggregationUnitInSeconds.toString(), 10);
        const validFrom = dateNow.unix() - dateNow.unix() % aggregationUnitInSeconds;
        const validThrough = validFrom + aggregationUnitInSeconds;

        return {
            identifier: `${client.id}:${validFrom.toString()}:${scope}`,
            validFrom: validFrom,
            validThrough: validThrough
        };
    }

    /**
     * クライアントとスコープ指定で許可証数をカウントアップする
     * @param client クライアント
     * @param scope スコープ
     */
    public async incr(client: ClientFactory.IClient, scope: string): Promise<IIssueUnit> {
        const issueUnitParams = RedisRepository.CREATE_ISSUE_UNIT_PARAMS(client, scope);
        // tslint:disable-next-line:no-magic-numbers
        const ttl = parseInt(client.passportIssueRule.aggregationUnitInSeconds.toString(), 10);

        const results = await this.redisClient.multi()
            .incr(issueUnitParams.identifier, debug)
            .expire(issueUnitParams.identifier, ttl, debug)
            .exec();
        debug('results:', results);

        return ({
            identifier: issueUnitParams.identifier,
            validFrom: issueUnitParams.validFrom,
            validThrough: issueUnitParams.validThrough,
            // tslint:disable-next-line:no-magic-numbers
            numberOfRequests: parseInt(results[0][1], 10)
        });
    }

    /**
     * クライアントとスコープ指定で現在の許可証発行単位を取得する
     * @param client クライアント
     * @param scope スコープ
     */
    public async now(client: ClientFactory.IClient, scope: string): Promise<IIssueUnit> {
        const issueUnitParams = RedisRepository.CREATE_ISSUE_UNIT_PARAMS(client, scope);
        const result = await this.redisClient.get(issueUnitParams.identifier, debug);
        debug('result:', result);

        return ({
            identifier: issueUnitParams.identifier,
            validFrom: issueUnitParams.validFrom,
            validThrough: issueUnitParams.validThrough,
            // tslint:disable-next-line:no-magic-numbers
            numberOfRequests: (result === null) ? 0 : parseInt(result, 10)
        });
    }
}
