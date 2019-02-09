// tslint:disable:no-implicit-dependencies
/**
 * 許可証カウンターリポジトリテスト
 */
import * as assert from 'assert';
import * as sinon from 'sinon';
// tslint:disable-next-line:mocha-no-side-effect-code no-require-imports no-var-requires
const redis = require('ioredis-mock');

// import * as errors from '../factory/errors';
import { RedisRepository as PassportIssueUnitRepo } from '../repo/passportIssueUnit';

let redisClient: any;
let sandbox: sinon.SinonSandbox;
before(() => {
    sandbox = sinon.createSandbox();
});

describe('PassportIssueUnitRepo.incr()', () => {
    beforeEach(() => {
        redisClient = new redis({});
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('redisが正常であれば、オブジェクトを取得できるはず', async () => {
        const issueDate = new Date();
        const rule = {
            name: 'name',
            description: 'description',
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 100,
            unavailableHoursSpecifications: []
        };
        const multi = redisClient.multi();
        const execResult = [[null, 1], [null, 1]];

        const passportCounterRepo = new PassportIssueUnitRepo(redisClient);
        sandbox.mock(redisClient).expects('multi').once().returns(multi);
        sandbox.mock(multi).expects('exec').once().resolves(execResult);

        const result = await passportCounterRepo.incr({
            issueDate: issueDate,
            project: <any>{},
            rule: <any>rule
        });
        assert.equal(typeof result, 'object');
        sandbox.verify();
    });

    it('redisが正常でなければ、エラーになるはず', async () => {
        const issueDate = new Date();
        const rule = {
            name: 'name',
            description: 'description',
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 100,
            unavailableHoursSpecifications: []
        };
        const multi = redisClient.multi();
        const execResult = new Error('execError');

        const passportCounterRepo = new PassportIssueUnitRepo(redisClient);
        sandbox.mock(redisClient).expects('multi').once().returns(multi);
        sandbox.mock(multi).expects('exec').once().rejects(execResult);

        const result = await passportCounterRepo.incr({
            issueDate: issueDate,
            project: <any>{},
            rule: <any>rule
        }).catch((err) => err);
        assert.deepEqual(result.message, execResult.message);
        sandbox.verify();
    });
});

describe('PassportCounterRepo.now()', () => {
    beforeEach(() => {
        redisClient = new redis({});
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('許可証がすでに発行されていれば、数を取得できるはず', async () => {
        const issueDate = new Date();
        const rule = {
            name: 'name',
            description: 'description',
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 100,
            unavailableHoursSpecifications: []
        };
        const execResult = 1;

        const passportCounterRepo = new PassportIssueUnitRepo(redisClient);
        sandbox.mock(redisClient).expects('get').once().resolves(execResult);

        const result = await passportCounterRepo.now({
            issueDate: issueDate,
            project: <any>{},
            rule: <any>rule
        });
        assert.equal(typeof result, 'object');
        assert.equal(result.numberOfRequests, execResult);
        sandbox.verify();
    });

    it('許可証が未発行の場合、数が0になるはず', async () => {
        const issueDate = new Date();
        const rule = {
            name: 'name',
            description: 'description',
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 100,
            unavailableHoursSpecifications: []
        };
        const execResult = null;

        const passportCounterRepo = new PassportIssueUnitRepo(redisClient);
        sandbox.mock(redisClient).expects('get').once().resolves(execResult);

        const result = await passportCounterRepo.now({
            issueDate: issueDate,
            project: <any>{},
            rule: <any>rule
        });
        assert.equal(typeof result, 'object');
        assert.equal(result.numberOfRequests, 0);
        sandbox.verify();
    });
});
