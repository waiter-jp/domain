/**
 * 許可証サービス
 * @namespace service.passport
 */

import * as createDebug from 'debug';
import * as jwt from 'jsonwebtoken';

import * as clientFactory from '../factory/client';
import * as passportFactory from '../factory/passport';
import { RedisRepository as PassportCounterRepo } from '../repo/passportCounter';

const debug = createDebug('waiter-domain:service:passport');

/**
 * redisリポジトリーで許可証を発行する
 * @export
 * @function
 * @param client クライアント
 * @param scope 許可証スコープ
 */
export function issueWithRedis(client: clientFactory.IClient, scope: string) {
    return async (passportCounterRepo: PassportCounterRepo): Promise<string | null> => {
        // tslint:disable-next-line:no-magic-numbers
        const workShiftInSeconds = parseInt(client.passportIssuerWorkShiftInSesonds.toString(), 10);
        const { issuer, issuedPlace } = await passportCounterRepo.incr(client, scope);
        debug('incremented. issuedPlace:', issuedPlace);

        if (issuedPlace > client.totalNumberOfPassportsPerIssuer) {
            return null;
        } else {
            const passport = passportFactory.create({
                client: client.id,
                scope: scope,
                issuer: issuer,
                issuedPlace: issuedPlace
            });
            debug('passport created.', passport);

            return await encode(passport, client.secret, workShiftInSeconds);
        }
    };
}

/**
 * 許可証を暗号化する
 * @export
 * @function
 * @param {IPassport} passport 許可証
 * @returns {Promise<string>}
 */
async function encode(passport: passportFactory.IPassport, secret: string, expiresIn: number) {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(
            passport,
            secret,
            {
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
}

/**
 * 暗号化された許可証を検証する
 * @export
 * @function
 * @param {string} encodedPassport
 * @param {string} secret
 * @returns {Promise<passportFactory.IPassport>}
 */
export async function verify(encodedPassport: string, secret: string): Promise<passportFactory.IPassport> {
    return new Promise<passportFactory.IPassport>((resolve, reject) => {
        jwt.verify(encodedPassport, secret, (err, decoded) => {
            if (err instanceof Error) {
                reject(err);
            } else {
                const passport = passportFactory.create(<any>decoded);
                resolve(passport);
            }
        });
    });
}
