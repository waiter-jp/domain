/**
 * 許可証サービス
 */
import * as factory from '@waiter/factory';
import * as createDebug from 'debug';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import * as util from 'util';
import * as validator from 'validator';

import { RedisRepository as PassportIssueUnitRepo } from '../repo/passportIssueUnit';
import { InMemoryRepository as RuleRepo } from '../repo/rule';

const debug = createDebug('waiter-domain:*');

/**
 * 許可証を発行する
 * @param scope 許可証スコープ
 */
export function issue(
    scope: string
) {
    return async (ruleRepo: RuleRepo, passportIssueUnitRepo: PassportIssueUnitRepo): Promise<factory.passport.IEncodedPassport> => {
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
                throw new factory.errors.ServiceUnavailable(message);
            }
        });

        if (passportIssueUnit.numberOfRequests > rule.threshold) {
            throw new factory.errors.RateLimitExceeded();
        }

        const payload = {
            scope: scope,
            issueUnit: passportIssueUnit,
            iat: now.unix()
        };

        return new Promise<factory.passport.IEncodedPassport>((resolve, reject) => {
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
 * @param scope 許可証スコープ
 */
export function currentIssueUnit(scope: string) {
    return async (ruleRepo: RuleRepo, passportIssueUnitRepo: PassportIssueUnitRepo): Promise<factory.passport.IIssueUnit> => {
        debug('rule exists?');
        const rule = ruleRepo.findbyScope(scope);
        const issueDate = moment().toDate();

        return passportIssueUnitRepo.now(issueDate, rule);
    };
}

/**
 * 暗号化された許可証を検証する
 */
export async function verify(token: string, secret: string): Promise<factory.passport.IPassport> {
    return new Promise<factory.passport.IPassport>((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err instanceof Error) {
                reject(err);
            } else {
                const passport = create(<any>decoded);
                resolve(passport);
            }
        });
    });
}

export function create(params: {
    scope: string;
    iat: number;
    exp: number;
    iss: string;
    issueUnit: factory.passport.IIssueUnit;
}): factory.passport.IPassport {
    if (validator.isEmpty(params.scope)) {
        throw new factory.errors.ArgumentNull('scope');
    }
    if (params.iat === undefined || !Number.isInteger(params.iat)) {
        throw new factory.errors.Argument('iat', 'iat must be number.');
    }
    if (params.exp === undefined || !Number.isInteger(params.exp)) {
        throw new factory.errors.Argument('exp', 'exp must be number.');
    }
    if (validator.isEmpty(params.iss)) {
        throw new factory.errors.ArgumentNull('iss');
    }
    if (params.issueUnit == null || typeof params.issueUnit !== 'object') {
        throw new factory.errors.Argument('issueUnit', 'issueUnit must be object.');
    }
    if (validator.isEmpty(params.issueUnit.identifier)) {
        throw new factory.errors.ArgumentNull('issueUnit.identifier');
    }
    if (params.issueUnit.numberOfRequests === undefined || !Number.isInteger(params.issueUnit.numberOfRequests)) {
        throw new factory.errors.Argument('issueUnit.numberOfRequests', 'issueUnit.numberOfRequests must be number.');
    }

    return {
        scope: params.scope,
        iat: params.iat,
        exp: params.exp,
        iss: params.iss,
        issueUnit: params.issueUnit
    };
}
