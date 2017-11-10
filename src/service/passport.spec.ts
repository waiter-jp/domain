/**
 * パスポートサービステスト
 * @ignore
 */

import * as assert from 'assert';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
// import * as redis from 'redis-mock';
import * as sinon from 'sinon';
// tslint:disable-next-line:mocha-no-side-effect-code no-require-imports no-var-requires
const redis = require('ioredis-mock');

import * as errors from '../factory/errors';
import { RedisRepository as PassportIssueUnitRepo } from '../repo/passportIssueUnit';
import { InMemoryRepository as RuleRepo } from '../repo/rule';
import * as passportService from '../service/passport';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('発行する', () => {
    beforeEach(() => {
        process.env.WAITER_SECRET = 'secret';
    });

    afterEach(() => {
        process.env.WAITER_SECRET = 'secret';
        sandbox.restore();
    });

    it('規則が存在しなければ、NotFoundエラーになるはず', async () => {
        process.env.WAITER_RULES = JSON.stringify([]);
        const scope = 'scope';

        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        const result = await passportService.issue(scope)(ruleRepo, passportCounterRepo).catch((err) => err);
        assert(result instanceof errors.NotFound);
        sandbox.verify();
    });

    it('許可証数上限に達すれば、RateLimitExceededエラーになるはず', async () => {
        const scope = 'scope';
        process.env.WAITER_RULES = JSON.stringify([{
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 0,
            unavailableHoursSpecifications: []
        }]);
        const incrResult = {
            identifier: 'scope:1508227500',
            validFrom: 1508227500,
            validThrough: 1508227800,
            numberOfRequests: 1
        };

        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        sandbox.mock(passportCounterRepo).expects('incr').once().resolves(incrResult);

        const result = await passportService.issue(scope)(ruleRepo, passportCounterRepo).catch((err) => err);
        assert(result instanceof errors.RateLimitExceeded);
        sandbox.verify();
    });

    it('サービス休止時間帯であれば、許可証を発行できないはず', async () => {
        const scope = 'scope';
        process.env.WAITER_RULES = JSON.stringify([{
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 100,
            unavailableHoursSpecifications: [{
                startDate: moment().add(-1, 'hour').toISOString(),
                endDate: moment().add(1, 'hour').toISOString()
            }]
        }]);

        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        const result = await passportService.issue(scope)(ruleRepo, passportCounterRepo).catch((err) => err);
        assert(result instanceof Error);
        console.error(result);
        // assert.equal(typeof result, 'string');
        sandbox.verify();
    });

    it('RedisCacheが正常であれば、許可証を発行できるはず', async () => {
        const scope = 'scope';
        process.env.WAITER_RULES = JSON.stringify([{
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 100,
            unavailableHoursSpecifications: []
        }]);
        const incrResult = {
            identifier: 'scope:1508227500',
            validFrom: 1508227500,
            validThrough: 1508227800,
            numberOfRequests: 1
        };

        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        sandbox.mock(passportCounterRepo).expects('incr').once().resolves(incrResult);

        const result = await passportService.issue(scope)(ruleRepo, passportCounterRepo);
        assert.equal(typeof result, 'string');
        sandbox.verify();
    });

    it('jwtモジュールで何かエラーが発生すれば、エラーになるはず', async () => {
        const scope = 'scope';
        process.env.WAITER_RULES = JSON.stringify([{
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 100,
            unavailableHoursSpecifications: []
        }]);
        const incrResult = {
            identifier: 'scope:1508227500',
            validFrom: 1508227500,
            validThrough: 1508227800,
            numberOfRequests: 1
        };
        const signReult = new Error('signError');

        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        sandbox.mock(passportCounterRepo).expects('incr').once().resolves(incrResult);
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(jwt).expects('sign').once().callsArgWith(3, signReult);

        const result = await passportService.issue(scope)(ruleRepo, passportCounterRepo).catch((err) => err);
        assert(result instanceof Error);
        sandbox.verify();
    });
});

describe('許可証トークンを検証する', () => {
    beforeEach(() => {
        process.env.WAITER_SECRET = 'secret';
    });

    afterEach(() => {
        process.env.WAITER_SECRET = 'secret';
    });

    it('jsonwebtokenが適切であれば、許可証オブジェクトを取得できるはず', async () => {
        const secret = 'secret';
        const token = '';
        const verifyResult = {
            scope: 'scope',
            iss: 'issuer',
            // aud: 'audience',
            issueUnit: {
                identifier: 'scope:1508227500',
                validFrom: 1508227500,
                validThrough: 1508227800,
                numberOfRequests: 2
            }
        };

        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(jwt).expects('verify').once().callsArgWith(2, null, verifyResult);

        const result = await passportService.verify(token, secret);
        assert.deepEqual(result, verifyResult);
        sandbox.verify();
    });

    it('秘密鍵が間違っていれば、JsonWebTokenErrorになるはず', async () => {
        const secret = 'invalidsecret';
        process.env.WAITER_RULES = JSON.stringify([{
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 100,
            unavailableHoursSpecifications: []
        }]);
        const scope = 'scope';
        const incrResult = {
            identifier: 'scope:1508227500',
            validFrom: 1508227500,
            validThrough: 1508227800,
            numberOfRequests: 1
        };

        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        sandbox.mock(passportCounterRepo).expects('incr').once().resolves(incrResult);

        // 許可証トークンを発行
        const token = await passportService.issue(scope)(ruleRepo, passportCounterRepo);

        const result = await passportService.verify(token, secret).catch((err) => err);
        assert(result instanceof Error);
        assert.equal(result.name, 'JsonWebTokenError');
        sandbox.verify();
    });

    it('jsonwebtokenが期限切れであれば、TokenExpiredErrorになるはず', async () => {
        const secret = 'secret';
        process.env.WAITER_RULES = JSON.stringify([{
            scope: 'scope',
            aggregationUnitInSeconds: 1,
            threshold: 100,
            unavailableHoursSpecifications: []
        }]);
        const scope = 'scope';
        const incrResult = {
            identifier: 'scope:1508227500',
            validFrom: 1508227500,
            validThrough: 1508227800,
            numberOfRequests: 1
        };

        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        sandbox.mock(passportCounterRepo).expects('incr').once().resolves(incrResult);

        const token = await passportService.issue(scope)(ruleRepo, passportCounterRepo);

        return new Promise((resolve, reject) => {
            setTimeout(
                async () => {
                    try {
                        const result = await passportService.verify(token, secret).catch((err) => err);
                        assert(result instanceof Error);
                        assert.equal(result.name, 'TokenExpiredError');
                        sandbox.verify();
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                },
                // tslint:disable-next-line:no-magic-numbers
                2000
            );
        });
    });
});

describe('service.passport.currentIssueUnit()', () => {
    beforeEach(() => {
        process.env.WAITER_SECRET = 'secret';
    });

    afterEach(() => {
        process.env.WAITER_SECRET = 'secret';
        sandbox.restore();
    });

    it('規則が存在しなければ、NotFoundエラーになるはず', async () => {
        process.env.WAITER_RULES = JSON.stringify([]);
        const scope = 'scope';

        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        const result = await passportService.currentIssueUnit(scope)(ruleRepo, passportCounterRepo).catch((err) => err);
        assert(result instanceof errors.NotFound);
        sandbox.verify();
    });

    it('RedisCacheが正常であれば、許可証発行リクエスト数を取得できるはず', async () => {
        const scope = 'scope';
        process.env.WAITER_RULES = JSON.stringify([{
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 100,
            unavailableHoursSpecifications: []
        }]);
        const incrResult = {
            identifier: 'scope:1508227500',
            validFrom: 1508227500,
            validThrough: 1508227800,
            numberOfRequests: 2
        };

        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        sandbox.mock(passportCounterRepo).expects('now').once().resolves(incrResult);

        const result = await passportService.currentIssueUnit(scope)(ruleRepo, passportCounterRepo);
        assert(Number.isInteger(result.numberOfRequests));
        sandbox.verify();
    });
});
