/**
 * パスポートサービステスト
 * @ignore
 */

import * as assert from 'assert';
import * as jwt from 'jsonwebtoken';
// import * as redis from 'redis-mock';
import * as sinon from 'sinon';
// tslint:disable-next-line:mocha-no-side-effect-code no-require-imports no-var-requires
const redis = require('ioredis-mock');

import * as errors from '../factory/errors';
import { InMemoryRepository as ClientRepo } from '../repo/client';
import { RedisRepository as PassportCounterRepo } from '../repo/passportCounter';
import * as passportService from '../service/passport';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('発行する', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('クライアントが存在しなければ、NotFoundエラーになるはず', async () => {
        process.env.WAITER_CLIENTS = JSON.stringify([]);
        const clientId = 'clientId';
        const scope = 'scope';

        const clientRepo = new ClientRepo();
        const passportCounterRepo = new PassportCounterRepo(new redis({}));

        const result = await passportService.issue(clientId, scope)(clientRepo, passportCounterRepo).catch((err) => err);
        assert(result instanceof errors.NotFound);
        sandbox.verify();
    });

    it('許可証数上限に達すれば、RateLimitExceededエラーになるはず', async () => {
        const clientId = 'clientId';
        const scope = 'scope';
        process.env.WAITER_CLIENTS = JSON.stringify([{
            id: clientId,
            secret: 'secret',
            passportIssuerWorkShiftInSesonds: 60,
            totalNumberOfPassportsPerIssuer: 0
        }]);
        const incrResult = { issuer: 'issuer', issuedPlace: 1 };

        const clientRepo = new ClientRepo();
        const passportCounterRepo = new PassportCounterRepo(new redis({}));

        sandbox.mock(passportCounterRepo).expects('incr').once().resolves(incrResult);

        const result = await passportService.issue(clientId, scope)(clientRepo, passportCounterRepo).catch((err) => err);
        assert(result instanceof errors.RateLimitExceeded);
        sandbox.verify();
    });

    it('RedisCacheが正常であれば、許可証を発行できるはず', async () => {
        const clientId = 'clientId';
        const scope = 'scope';
        process.env.WAITER_CLIENTS = JSON.stringify([{
            id: clientId,
            secret: 'secret',
            passportIssuerWorkShiftInSesonds: 60,
            totalNumberOfPassportsPerIssuer: 100
        }]);
        const incrResult = { issuer: 'issuer', issuedPlace: 1 };

        const clientRepo = new ClientRepo();
        const passportCounterRepo = new PassportCounterRepo(new redis({}));

        sandbox.mock(passportCounterRepo).expects('incr').once().resolves(incrResult);

        const result = await passportService.issue(clientId, scope)(clientRepo, passportCounterRepo);
        assert.equal(typeof result, 'string');
        sandbox.verify();
    });

    it('jwtモジュールで何かエラーが発生すれば、エラーになるはず', async () => {
        const clientId = 'clientId';
        const scope = 'scope';
        process.env.WAITER_CLIENTS = JSON.stringify([{
            id: clientId,
            secret: 'secret',
            passportIssuerWorkShiftInSesonds: 60,
            totalNumberOfPassportsPerIssuer: 100
        }]);
        const incrResult = { issuer: 'issuer', issuedPlace: 1 };
        const signReult = new Error('signError');

        const clientRepo = new ClientRepo();
        const passportCounterRepo = new PassportCounterRepo(new redis({}));

        sandbox.mock(passportCounterRepo).expects('incr').once().resolves(incrResult);
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(jwt).expects('sign').once().callsArgWith(3, signReult);

        const result = await passportService.issue(clientId, scope)(clientRepo, passportCounterRepo).catch((err) => err);
        assert(result instanceof Error);
        sandbox.verify();
    });
});

describe('許可証トークンを検証する', () => {
    it('jsonwebtokenが適切であれば、許可証オブジェクトを取得できるはず', async () => {
        const secret = 'secret';
        const token = '';
        const verifyResult = {
            scope: 'scope',
            issuer: 'issuer',
            audience: 'audience',
            issuedPlace: 123
        };

        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(jwt).expects('verify').once().callsArgWith(2, null, verifyResult);

        const result = await passportService.verify(token, secret);
        assert.deepEqual(result, verifyResult);
        sandbox.verify();
    });

    it('秘密鍵が間違っていれば、JsonWebTokenErrorになるはず', async () => {
        const clientId = 'clientId';
        const secret = 'secret';
        process.env.WAITER_CLIENTS = JSON.stringify([{
            id: clientId,
            secret: secret,
            passportIssuerWorkShiftInSesonds: 60,
            totalNumberOfPassportsPerIssuer: 100
        }]);
        const scope = 'scope';
        const incrResult = { issuer: 'issuer', issuedPlace: 1 };

        const clientRepo = new ClientRepo();
        const passportCounterRepo = new PassportCounterRepo(new redis({}));

        sandbox.mock(passportCounterRepo).expects('incr').once().resolves(incrResult);

        // 許可証トークンを発行
        const token = await passportService.issue(clientId, scope)(clientRepo, passportCounterRepo);

        const result = await passportService.verify(token, 'invalidsecret').catch((err) => err);
        assert(result instanceof Error);
        assert.equal(result.name, 'JsonWebTokenError');
        sandbox.verify();
    });

    it('jsonwebtokenが期限切れであれば、TokenExpiredErrorになるはず', async () => {
        const clientId = 'clientId';
        const secret = 'secret';
        process.env.WAITER_CLIENTS = JSON.stringify([{
            id: clientId,
            secret: secret,
            passportIssuerWorkShiftInSesonds: 1,
            totalNumberOfPassportsPerIssuer: 100
        }]);
        const scope = 'scope';
        const incrResult = { issuer: 'issuer', issuedPlace: 1 };

        const clientRepo = new ClientRepo();
        const passportCounterRepo = new PassportCounterRepo(new redis({}));

        sandbox.mock(passportCounterRepo).expects('incr').once().resolves(incrResult);

        const token = await passportService.issue(clientId, scope)(clientRepo, passportCounterRepo);

        return new Promise((resolve) => {
            setTimeout(
                async () => {
                    const result = await passportService.verify(token, secret).catch((err) => err);
                    assert(result instanceof Error);
                    assert.equal(result.name, 'TokenExpiredError');
                    sandbox.verify();
                    resolve();
                },
                // tslint:disable-next-line:no-magic-numbers
                2000
            );
        });
    });
});

describe('現在の許可証数を取得する', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('クライアントが存在しなければ、NotFoundエラーになるはず', async () => {
        process.env.WAITER_CLIENTS = JSON.stringify([]);
        const clientId = 'clientId';
        const scope = 'scope';

        const clientRepo = new ClientRepo();
        const passportCounterRepo = new PassportCounterRepo(new redis({}));

        const result = await passportService.getCounter(clientId, scope)(clientRepo, passportCounterRepo).catch((err) => err);
        assert(result instanceof errors.NotFound);
        sandbox.verify();
    });

    it('RedisCacheが正常であれば、許可証数を取得できるはず', async () => {
        const clientId = 'clientId';
        const scope = 'scope';
        process.env.WAITER_CLIENTS = JSON.stringify([{
            id: clientId,
            secret: 'secret',
            passportIssuerWorkShiftInSesonds: 60,
            totalNumberOfPassportsPerIssuer: 100
        }]);
        const incrResult = { issuer: 'issuer', issuedPlace: 1 };

        const clientRepo = new ClientRepo();
        const passportCounterRepo = new PassportCounterRepo(new redis({}));

        sandbox.mock(passportCounterRepo).expects('now').once().resolves(incrResult);

        const result = await passportService.getCounter(clientId, scope)(clientRepo, passportCounterRepo);
        assert(Number.isInteger(result));
        sandbox.verify();
    });
});
