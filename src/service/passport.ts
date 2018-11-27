/**
 * 許可証サービス
 */
import * as createDebug from 'debug';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import * as util from 'util';
import * as validator from 'validator';

import * as factory from '../factory';

import { RedisRepository as PassportIssueUnitRepo } from '../repo/passportIssueUnit';
import { InMemoryRepository as ProjectRepo } from '../repo/project';
import { InMemoryRepository as RuleRepo } from '../repo/rule';

const debug = createDebug('waiter-domain:repository');

/**
 * 許可証を発行する
 */
export function issue(params: {
    project: { id: string };
    scope: string;
}) {
    return async (repos: {
        passportIssueUnit: PassportIssueUnitRepo;
        project: ProjectRepo;
        rule: RuleRepo;
    }): Promise<factory.passport.IEncodedPassport> => {
        const project = repos.project.findById({ id: params.project.id });
        const rule = repos.rule.findByScope(params);
        const now = moment();
        debug('now is', now.toDate(), now.unix());

        const passportIssueUnit = await repos.passportIssueUnit.incr({
            issueDate: now.toDate(), project: project, rule: rule
        });
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
            aud: project.id,
            scope: params.scope,
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
 */
export function currentIssueUnit(params: {
    project: { id: string };
    scope: string;
}) {
    return async (repos: {
        passportIssueUnit: PassportIssueUnitRepo;
        project: ProjectRepo;
        rule: RuleRepo;
    }): Promise<factory.passport.IIssueUnit> => {
        const project = repos.project.findById({ id: params.project.id });
        const rule = repos.rule.findByScope(params);
        const issueDate = moment().toDate();

        return repos.passportIssueUnit.now({
            issueDate: issueDate, project: project, rule: rule
        });
    };
}

/**
 * 暗号化された許可証を検証する
 */
export async function verify(params: {
    token: string;
    secret: string;
}): Promise<factory.passport.IPassport> {
    return new Promise<factory.passport.IPassport>((resolve, reject) => {
        jwt.verify(params.token, params.secret, (err, decoded) => {
            if (err instanceof Error) {
                reject(err);
            } else {
                const passport = create(<any>decoded);
                resolve(passport);
            }
        });
    });
}

export function create(params: any): factory.passport.IPassport {
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
        aud: params.aud,
        scope: params.scope,
        iat: params.iat,
        exp: params.exp,
        iss: params.iss,
        issueUnit: params.issueUnit
    };
}
