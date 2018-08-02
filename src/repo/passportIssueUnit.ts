import * as factory from '@waiter/factory';
import * as createDebug from 'debug';
import * as redis from 'ioredis';
import * as moment from 'moment';

const debug = createDebug('waiter-domain:*');

/**
 * 許可証発行単位Redisレポジトリー
 */
export class RedisRepository {
    public readonly redisClient: redis.Redis;

    constructor(redisClient: redis.Redis) {
        this.redisClient = redisClient;
    }

    /**
     * 発行単位属性を作成する
     * @param issueDate 発行日時
     * @param rule 発行ルール
     */
    public static CREATE_ISSUE_UNIT_PARAMS(issueDate: Date, rule: factory.rule.IRule) {
        const dateNow = moment(issueDate);
        // tslint:disable-next-line:no-magic-numbers
        const aggregationUnitInSeconds = parseInt(rule.aggregationUnitInSeconds.toString(), 10);
        const validFrom = dateNow.unix() - dateNow.unix() % aggregationUnitInSeconds;
        const validThrough = validFrom + aggregationUnitInSeconds;

        return {
            identifier: `${rule.scope}:${validFrom.toString()}`,
            validFrom: validFrom,
            validThrough: validThrough
        };
    }

    /**
     * 許可証数をカウントアップする
     * @param issueDate 発行日時
     * @param rule 発行ルール
     */
    public async incr(issueDate: Date, rule: factory.rule.IRule): Promise<factory.passport.IIssueUnit> {
        const issueUnitParams = RedisRepository.CREATE_ISSUE_UNIT_PARAMS(issueDate, rule);
        // tslint:disable-next-line:no-magic-numbers
        const ttl = parseInt(rule.aggregationUnitInSeconds.toString(), 10);

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
     * 現在の許可証発行単位を取得する
     * @param issueDate 発行日時
     * @param rule 発行ルール
     */
    public async now(issueDate: Date, rule: factory.rule.IRule): Promise<factory.passport.IIssueUnit> {
        const issueUnitParams = RedisRepository.CREATE_ISSUE_UNIT_PARAMS(issueDate, rule);
        const result = await this.redisClient.get(issueUnitParams.identifier);
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
