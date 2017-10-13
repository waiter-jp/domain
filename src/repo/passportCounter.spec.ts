/**
 * 許可証カウンターレポジトリーテスト
 * @ignore
 */

import * as assert from 'assert';
import * as redis from 'redis-mock';
import * as sinon from 'sinon';

// import * as errors from '../factory/errors';
import { RedisRepository as PassportCounterRepo } from '../repo/passportCounter';

let redisClient: redis.RedisClient;
let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('PassportCounterRepo.incr()', () => {
    beforeEach(() => {
        redisClient = redis.createClient();
    });

    afterEach(() => {
        sandbox.restore();
        redisClient.quit();
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
        const execResult = [1, 1];

        const passportCounterRepo = new PassportCounterRepo(redisClient);
        sandbox.mock(redisClient).expects('multi').once().returns(multi);
        sandbox.mock(multi).expects('exec').once().callsArgWith(0, null, execResult);

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
        sandbox.mock(multi).expects('exec').once().callsArgWith(0, execResult);

        const result = await passportCounterRepo.incr(client, scope).catch((err) => err);
        assert.deepEqual(result, execResult);
        sandbox.verify();
    });
});
