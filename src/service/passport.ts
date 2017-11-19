/**
 * 許可証サービス
 * @namespace service.passport
 */

import * as createDebug from 'debug';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import * as util from 'util';

import * as errors from '../factory/errors';
import * as PassportFactory from '../factory/passport';
import { RedisRepository as PassportIssueUnitRepo } from '../repo/passportIssueUnit';
import { InMemoryRepository as RuleRepo } from '../repo/rule';

const debug = createDebug('waiter-domain:service:passport');

/**
 * 許可証を発行する
 * @export
 * @function
 * @param scope 許可証スコープ
 */
export function issue(
    scope: string
) {
    return async (ruleRepo: RuleRepo, passportIssueUnitRepo: PassportIssueUnitRepo): Promise<PassportFactory.IEncodedPassport> => {
        debug('rule exists?');
        const rule = ruleRepo.findbyScope(scope);
        const now = moment();
        debug('now is', now.toDate(), now.unix());

        const passportIssueUnit = await passportIssueUnitRepo.incr(now.toDate(), rule);
        debug('incremented. passportIssueUnit:', passportIssueUnit);

        // サービス休止時間帯であれば、問答無用に発行できない
        rule.unavailableHoursSpecifications.forEach((specification) => {
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (now.toDate() >= specification.startDate && now.toDate() <= specification.endDate) {
                const message = util.format(
                    'Specified scope unavailable from %s to %s.',
                    specification.startDate.toISOString(),
                    specification.endDate.toISOString()
                );
                throw new errors.ServiceUnavailable(message);
            }
        });

        if (passportIssueUnit.numberOfRequests > rule.threshold) {
            throw new errors.RateLimitExceeded();
        }

        const payload = {
            scope: scope,
            issueUnit: passportIssueUnit,
            iat: now.unix()
        };

        return new Promise<PassportFactory.IEncodedPassport>((resolve, reject) => {
            // 許可証を暗号化する
            jwt.sign(
                payload,
                <string>process.env.WAITER_SECRET,
                {
                    issuer: <string>process.env.WAITER_PASSPORT_ISSUER,
                    // tslint:disable-next-line:no-magic-numbers
                    expiresIn: parseInt(rule.aggregationUnitInSeconds.toString(), 10)
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
    };
}

/**
 * 現在の許可証発行単位を取得する
 * @export
 * @function
 * @param scope 許可証スコープ
 */
export function currentIssueUnit(scope: string) {
    return async (ruleRepo: RuleRepo, passportIssueUnitRepo: PassportIssueUnitRepo): Promise<PassportFactory.IIssueUnit> => {
        debug('rule exists?');
        const rule = ruleRepo.findbyScope(scope);
        const issueDate = moment().toDate();

        return passportIssueUnitRepo.now(issueDate, rule);
    };
}

/**
 * 暗号化された許可証を検証する
 * @export
 * @function
 * @param {string} token
 * @param {string} secret
 * @returns {Promise<PassportFactory.IPassport>}
 */
export async function verify(token: string, secret: string): Promise<PassportFactory.IPassport> {
    return new Promise<PassportFactory.IPassport>((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err instanceof Error) {
                reject(err);
            } else {
                const passport = PassportFactory.create(<any>decoded);
                resolve(passport);
            }
        });
    });
}
