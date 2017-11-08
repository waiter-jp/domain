/**
 * 許可証サービス
 * @namespace service.passport
 */

import * as createDebug from 'debug';
import * as jwt from 'jsonwebtoken';

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

        // tslint:disable-next-line:no-magic-numbers
        const workShiftInSeconds = parseInt(rule.aggregationUnitInSeconds.toString(), 10);
        const passportIssueUnit = await passportIssueUnitRepo.incr(rule);
        debug('incremented. passportIssueUnit:', passportIssueUnit);

        if (passportIssueUnit.numberOfRequests > rule.threshold) {
            throw new errors.RateLimitExceeded();
        }

        const payload = {
            scope: scope,
            issueUnit: passportIssueUnit
        };

        return new Promise<PassportFactory.IEncodedPassport>((resolve, reject) => {
            // 許可証を暗号化する
            jwt.sign(
                payload,
                <string>process.env.WAITER_SECRET,
                {
                    issuer: <string>process.env.WAITER_PASSPORT_ISSUER,
                    // audience: '',
                    expiresIn: workShiftInSeconds
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

        return passportIssueUnitRepo.now(rule);
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
