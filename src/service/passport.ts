/**
 * 許可証サービス
 * @namespace service.passport
 */

import * as createDebug from 'debug';
import * as jwt from 'jsonwebtoken';

import * as errors from '../factory/errors';
import * as PassportFactory from '../factory/passport';
import { InMemoryRepository as ClientRepo } from '../repo/client';
import { RedisRepository as PassportIssueUnitRepo } from '../repo/passportIssueUnit';

const debug = createDebug('waiter-domain:service:passport');

/**
 * 許可証を発行する
 * @export
 * @function
 * @param client クライアント
 * @param scope 許可証スコープ
 */
export function issue(
    clientId: string,
    scope: string
) {
    return async (clientRepo: ClientRepo, passportIssueUnitRepo: PassportIssueUnitRepo): Promise<PassportFactory.IEncodedPassport> => {
        debug('client exists?');
        const client = clientRepo.findbyId(clientId);

        // tslint:disable-next-line:no-magic-numbers
        const workShiftInSeconds = parseInt(client.passportIssueRule.aggregationUnitInSeconds.toString(), 10);
        const passportIssueUnit = await passportIssueUnitRepo.incr(client, scope);
        debug('incremented. passportIssueUnit:', passportIssueUnit);

        if (passportIssueUnit.numberOfRequests > client.passportIssueRule.threshold) {
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
                client.secret,
                {
                    issuer: <string>process.env.WAITER_PASSPORT_ISSUER,
                    audience: client.id,
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
 * @param client クライアント
 * @param scope 許可証スコープ
 */
export function currentIssueUnit(clientId: string, scope: string) {
    return async (clientRepo: ClientRepo, passportIssueUnitRepo: PassportIssueUnitRepo): Promise<PassportFactory.IIssueUnit> => {
        debug('client exists?');
        const client = clientRepo.findbyId(clientId);

        return await passportIssueUnitRepo.now(client, scope);
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
