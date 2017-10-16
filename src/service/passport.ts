/**
 * 許可証サービス
 * @namespace service.passport
 */

import * as createDebug from 'debug';
import * as jwt from 'jsonwebtoken';

import * as errors from '../factory/errors';
import * as passportFactory from '../factory/passport';
import { InMemoryRepository as ClientRepo } from '../repo/client';
import { RedisRepository as PassportCounterRepo } from '../repo/passportCounter';

const debug = createDebug('waiter-domain:service:passport');

/**
 * 許可証を発行する
 * @export
 * @function
 * @param client クライアント
 * @param scope 許可証スコープ
 */
export function issue(clientId: string, scope: string) {
    return async (clientRepo: ClientRepo, passportCounterRepo: PassportCounterRepo): Promise<string> => {
        debug('client exists?');
        const client = clientRepo.findbyId(clientId);

        // tslint:disable-next-line:no-magic-numbers
        const workShiftInSeconds = parseInt(client.passportIssueRule.aggregationUnitInSeconds.toString(), 10);
        const { issueUnitName, issuedPlace } = await passportCounterRepo.incr(client, scope);
        debug('incremented. issuedPlace:', issuedPlace);

        if (issuedPlace > client.passportIssueRule.threshold) {
            throw new errors.RateLimitExceeded();
        }

        const payload = {
            scope: scope,
            issueUnitName: issueUnitName,
            issuedPlace: issuedPlace
        };

        return new Promise<string>((resolve, reject) => {
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
 * 現在の許可証発行数を取得する
 * @export
 * @function
 * @param client クライアント
 * @param scope 許可証スコープ
 */
export function getCounter(clientId: string, scope: string) {
    return async (clientRepo: ClientRepo, passportCounterRepo: PassportCounterRepo): Promise<number> => {
        debug('client exists?');
        const client = clientRepo.findbyId(clientId);

        const { issueUnitName, issuedPlace } = await passportCounterRepo.now(client, scope);
        debug('passportCounter.now:', issueUnitName, issuedPlace);

        return issuedPlace;
    };
}

/**
 * 暗号化された許可証を検証する
 * @export
 * @function
 * @param {string} token
 * @param {string} secret
 * @returns {Promise<passportFactory.IPassport>}
 */
export async function verify(token: string, secret: string): Promise<passportFactory.IPassport> {
    return new Promise<passportFactory.IPassport>((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err instanceof Error) {
                reject(err);
            } else {
                const passport = passportFactory.create(<any>decoded);
                resolve(passport);
            }
        });
    });
}
