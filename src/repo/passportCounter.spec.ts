/**
 * 許可証カウンターレポジトリーテスト
 * @ignore
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
// tslint:disable-next-line:mocha-no-side-effect-code no-require-imports no-var-requires
const redis = require('ioredis-mock');

// import * as errors from '../factory/errors';
import { RedisRepository as PassportCounterRepo } from '../repo/passportCounter';

let redisClient: any;
let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('PassportCounterRepo.incr()', () => {
    beforeEach(() => {
        redisClient = new redis({});
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('redisが正常であれば、オブジェクトを取得できるはず', async () => {
        const client = {
            id: 'clientId',
            secret: 'secret',
            passportIssuerWorkShiftInSesonds: 60,
            totalNumberOfPassportsPerIssuer: 100
        };
        const scope = 'scope';
        const multi = redisClient.multi();
        const execResult = [[null, 1], [null, 1]];

        const passportCounterRepo = new PassportCounterRepo(redisClient);
        sandbox.mock(redisClient).expects('multi').once().returns(multi);
        sandbox.mock(multi).expects('exec').once().resolves(execResult);

        const result = await passportCounterRepo.incr(client, scope);
        assert.equal(typeof result, 'object');
        sandbox.verify();
    });

    it('redisが正常でなければ、エラーになるはず', async () => {
        const client = {
            id: 'clientId',
            secret: 'secret',
            passportIssuerWorkShiftInSesonds: 60,
            totalNumberOfPassportsPerIssuer: 100
        };
        const scope = 'scope';
        const multi = redisClient.multi();
        const execResult = new Error('execError');

        const passportCounterRepo = new PassportCounterRepo(redisClient);
        sandbox.mock(redisClient).expects('multi').once().returns(multi);
        sandbox.mock(multi).expects('exec').once().rejects(execResult);

        const result = await passportCounterRepo.incr(client, scope).catch((err) => err);
        assert.deepEqual(result.message, execResult.message);
        sandbox.verify();
    });
});
