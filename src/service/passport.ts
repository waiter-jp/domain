/**
 * 許可証サービス
 */
import * as createDebug from 'debug';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import * as util from 'util';

import * as factory from '../factory';

import { RedisRepository as PassportIssueUnitRepo } from '../repo/passportIssueUnit';
import { InMemoryRepository as RuleRepo } from '../repo/rule';

const debug = createDebug('waiter-domain:repository');

/**
 * 許可証を発行する
 */
export function issue(params: {
    project: { id: string };
    scope: string;
    expiresIn?: number;
}) {
    return async (repos: {
        passportIssueUnit: PassportIssueUnitRepo;
        rule: RuleRepo;
    }): Promise<factory.passport.IEncodedPassport> => {
        const now = new Date();
        debug('now is', now);

        // const project = repos.project.findById({ id: params.project.id });
        const rules = repos.rule.search({
            project: { ids: [params.project.id] },
            scopes: [params.scope]
        });
        const rule = rules.shift();
        if (rule === undefined) {
            throw new factory.errors.NotFound('Rule');
        }

        const passportIssueUnit = await repos.passportIssueUnit.incr({
            issueDate: now, project: params.project, rule: rule
        });
        debug('incremented. passportIssueUnit:', passportIssueUnit);

        // サービス利用可能期間指定があれば、どれかひとつの期間に適合すればok
        if (Array.isArray(rule.availableHoursSpecifications)) {
            // 空配列であればunavailableとなります
            const unavailable = rule.availableHoursSpecifications.every((spec) => {
                return now < spec.startDate || now > spec.endDate;
            });

            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (unavailable) {
                throw new factory.errors.ServiceUnavailable('Not within the available period');
            }
        }

        // サービス利用不可期間であれば、どれかひとつの不可期間にあてはまれば不許可
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (Array.isArray(rule.unavailableHoursSpecifications)) {
            rule.unavailableHoursSpecifications.forEach((spec) => {
                // tslint:disable-next-line:no-single-line-block-comment
                /* istanbul ignore else */
                if (now >= spec.startDate && now <= spec.endDate) {
                    const message = util.format(
                        'Specified scope unavailable from %s to %s',
                        spec.startDate.toISOString(),
                        spec.endDate.toISOString()
                    );

                    throw new factory.errors.ServiceUnavailable(message);
                }
            });
        }

        if (passportIssueUnit.numberOfRequests > rule.threshold) {
            throw new factory.errors.RateLimitExceeded();
        }

        const payload = {
            aud: (rule.client !== undefined) ? rule.client.map((r) => r.id) : undefined,
            scope: params.scope,
            issueUnit: passportIssueUnit,
            project: params.project,
            iat: moment(now)
                .unix()
        };

        return new Promise<factory.passport.IEncodedPassport>((resolve, reject) => {
            const expiresIn = Number(rule.aggregationUnitInSeconds.toString())
                + ((params.expiresIn !== undefined) /* istanbul ignore next */ ? Number(params.expiresIn) : 0);

            // 許可証を暗号化する
            jwt.sign(
                payload,
                <string>process.env.WAITER_SECRET,
                {
                    issuer: <string>process.env.WAITER_PASSPORT_ISSUER,
                    expiresIn: expiresIn
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
        rule: RuleRepo;
    }): Promise<factory.passport.IIssueUnit> => {
        // const project = repos.project.findById({ id: params.project.id });
        const rules = repos.rule.search({
            project: { ids: [params.project.id] },
            scopes: [params.scope]
        });
        const rule = rules.shift();
        if (rule === undefined) {
            throw new factory.errors.NotFound('Rule');
        }
        const issueDate = moment()
            .toDate();

        return repos.passportIssueUnit.now({
            issueDate: issueDate, project: params.project, rule: rule
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
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore if */
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
    if (typeof params.scope !== 'string' || params.scope.length === 0) {
        throw new factory.errors.ArgumentNull('scope');
    }
    if (typeof params.iat !== 'number') {
        throw new factory.errors.Argument('iat', 'iat must be number');
    }
    if (typeof params.exp !== 'number') {
        throw new factory.errors.Argument('exp', 'exp must be number');
    }
    if (typeof params.iss !== 'string' || params.iss.length === 0) {
        throw new factory.errors.ArgumentNull('iss');
    }
    if (typeof params.issueUnit?.identifier !== 'string' || params.issueUnit.identifier.length === 0) {
        throw new factory.errors.Argument('issueUnit.identifier', 'issueUnit.identifier must be string');
    }
    if (typeof params.issueUnit.numberOfRequests !== 'number') {
        throw new factory.errors.Argument('issueUnit.numberOfRequests', 'issueUnit.numberOfRequests must be number');
    }

    return {
        aud: params.aud,
        scope: params.scope,
        iat: params.iat,
        exp: params.exp,
        iss: params.iss,
        project: params.project,
        issueUnit: params.issueUnit
    };
}
