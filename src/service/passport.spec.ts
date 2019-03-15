// tslint:disable:no-implicit-dependencies
/**
 * 許可証サービステスト
 */
import * as assert from 'assert';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
// import * as redis from 'redis-mock';
import * as sinon from 'sinon';
// tslint:disable-next-line:mocha-no-side-effect-code no-require-imports no-var-requires
const redis = require('ioredis-mock');

import * as factory from '../factory';
import { RedisRepository as PassportIssueUnitRepo } from '../repo/passportIssueUnit';
import { InMemoryRepository as ProjectRepo } from '../repo/project';
import { InMemoryRepository as RuleRepo } from '../repo/rule';
import * as passportService from '../service/passport';

let sandbox: sinon.SinonSandbox;
before(() => {
    sandbox = sinon.createSandbox();
});

describe('発行する', () => {
    beforeEach(() => {
        sandbox.restore();
        process.env.WAITER_SECRET = 'secret';
        process.env.WAITER_PASSPORT_ISSUER = 'https://example.com';
    });

    afterEach(() => {
        delete process.env.WAITER_RULES;
        delete process.env.WAITER_PROJECTS;
    });

    it('規則が存在しなければ、NotFoundエラーになるはず', async () => {
        process.env.WAITER_RULES = JSON.stringify([]);
        process.env.WAITER_PROJECTS = JSON.stringify([]);
        const scope = 'scope';

        const projectRepo = new ProjectRepo();
        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        sandbox.mock(projectRepo).expects('findById').once().returns({});

        const result = await passportService.issue({
            project: { id: 'projectId' },
            scope: scope
        })({
            passportIssueUnit: passportCounterRepo,
            project: projectRepo,
            rule: ruleRepo
        }).catch((err) => err);
        assert(result instanceof factory.errors.NotFound);
        sandbox.verify();
    });

    it('許可証数上限に達すれば、RateLimitExceededエラーになるはず', async () => {
        const scope = 'scope';
        const project = { id: 'projectId' };
        process.env.WAITER_RULES = JSON.stringify([{
            project: { id: project.id },
            name: 'name',
            description: 'description',
            scope: scope,
            aggregationUnitInSeconds: 60,
            threshold: 0,
            unavailableHoursSpecifications: []
        }]);
        process.env.WAITER_PROJECTS = JSON.stringify([]);
        const incrResult = {
            identifier: 'scope:1508227500',
            validFrom: 1508227500,
            validThrough: 1508227800,
            numberOfRequests: 1
        };

        const projectRepo = new ProjectRepo();
        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        sandbox.mock(projectRepo).expects('findById').once().returns(project);
        sandbox.mock(passportCounterRepo).expects('incr').once().resolves(incrResult);

        const result = await passportService.issue({
            project: { id: project.id },
            scope: scope
        })({
            passportIssueUnit: passportCounterRepo,
            project: projectRepo,
            rule: ruleRepo
        }).catch((err) => err);
        assert(result instanceof factory.errors.RateLimitExceeded);
        sandbox.verify();
    });

    it('サービス利用可能期間外であれば、許可証を発行できないはず', async () => {
        const scope = 'scope';
        const project = { id: 'projectId' };
        process.env.WAITER_RULES = JSON.stringify([{
            project: { id: project.id },
            name: 'name',
            description: 'description',
            scope: scope,
            aggregationUnitInSeconds: 60,
            threshold: 100,
            availableHoursSpecifications: [
                {
                    startDate: moment().add(1, 'hours').toISOString(),
                    // tslint:disable-next-line:no-magic-numbers
                    endDate: moment().add(2, 'hours').toISOString()
                },
                {
                    // tslint:disable-next-line:no-magic-numbers
                    startDate: moment().add(-2, 'hours').toISOString(),
                    endDate: moment().add(-1, 'hours').toISOString()
                }
            ]
        }]);
        process.env.WAITER_PROJECTS = JSON.stringify([]);

        const projectRepo = new ProjectRepo();
        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        sandbox.mock(projectRepo).expects('findById').once().returns(project);

        const result = await passportService.issue({
            project: { id: project.id },
            scope: scope
        })({
            passportIssueUnit: passportCounterRepo,
            project: projectRepo,
            rule: ruleRepo
        }).catch((err) => err);
        assert(result instanceof factory.errors.ServiceUnavailable);
        sandbox.verify();
    });

    it('サービス休止時間帯であれば、許可証を発行できないはず', async () => {
        const scope = 'scope';
        const project = { id: 'projectId' };
        process.env.WAITER_RULES = JSON.stringify([{
            project: { id: project.id },
            name: 'name',
            description: 'description',
            scope: scope,
            aggregationUnitInSeconds: 60,
            threshold: 100,
            unavailableHoursSpecifications: [{
                startDate: moment().add(-1, 'hour').toISOString(),
                endDate: moment().add(1, 'hour').toISOString()
            }]
        }]);
        process.env.WAITER_PROJECTS = JSON.stringify([]);

        const projectRepo = new ProjectRepo();
        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        sandbox.mock(projectRepo).expects('findById').once().returns(project);

        const result = await passportService.issue({
            project: { id: project.id },
            scope: scope
        })({
            passportIssueUnit: passportCounterRepo,
            project: projectRepo,
            rule: ruleRepo
        }).catch((err) => err);
        assert(result instanceof factory.errors.ServiceUnavailable);
        sandbox.verify();
    });

    it('RedisCacheが正常であれば、許可証を発行できるはず', async () => {
        const scope = 'scope';
        const project = { id: 'projectId' };
        process.env.WAITER_RULES = JSON.stringify([{
            project: { id: project.id },
            client: [{ id: 'clientId' }],
            name: 'name',
            description: 'description',
            scope: scope,
            aggregationUnitInSeconds: 60,
            threshold: 100,
            unavailableHoursSpecifications: []
        }]);
        process.env.WAITER_PROJECTS = JSON.stringify([]);
        const incrResult = {
            identifier: 'scope:1508227500',
            validFrom: 1508227500,
            validThrough: 1508227800,
            numberOfRequests: 1
        };

        const projectRepo = new ProjectRepo();
        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        sandbox.mock(projectRepo).expects('findById').once().returns(project);
        sandbox.mock(passportCounterRepo).expects('incr').once().resolves(incrResult);

        const result = await passportService.issue({
            project: { id: project.id },
            scope: scope
        })({
            passportIssueUnit: passportCounterRepo,
            project: projectRepo,
            rule: ruleRepo
        });
        assert.equal(typeof result, 'string');
        sandbox.verify();
    });

    it('jwtモジュールで何かエラーが発生すれば、エラーになるはず', async () => {
        const scope = 'scope';
        const project = { id: 'projectId' };
        process.env.WAITER_RULES = JSON.stringify([{
            project: { id: project.id },
            name: 'name',
            description: 'description',
            scope: scope,
            aggregationUnitInSeconds: 60,
            threshold: 100,
            unavailableHoursSpecifications: []
        }]);
        process.env.WAITER_PROJECTS = JSON.stringify([]);
        const incrResult = {
            identifier: 'scope:1508227500',
            validFrom: 1508227500,
            validThrough: 1508227800,
            numberOfRequests: 1
        };
        const signReult = new Error('signError');

        const projectRepo = new ProjectRepo();
        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        sandbox.mock(projectRepo).expects('findById').once().returns(project);
        sandbox.mock(passportCounterRepo).expects('incr').once().resolves(incrResult);
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(jwt).expects('sign').once().callsArgWith(3, signReult);

        const result = await passportService.issue({
            project: { id: project.id },
            scope: scope
        })({
            passportIssueUnit: passportCounterRepo,
            project: projectRepo,
            rule: ruleRepo
        }).catch((err) => err);
        assert(result instanceof Error);
        sandbox.verify();
    });
});

describe('許可証トークンを検証する', () => {
    beforeEach(() => {
        process.env.WAITER_SECRET = 'secret';
    });

    it('jsonwebtokenが適切であれば、許可証オブジェクトを取得できるはず', async () => {
        const secret = 'secret';
        const token = 'token';
        const verifyResult = {
            scope: 'scope',
            iat: 1511059610,
            exp: 1511059910,
            iss: 'issuer',
            issueUnit: {
                identifier: 'identifier',
                validFrom: 1508227500,
                validThrough: 1508227800,
                numberOfRequests: 2
            }
        };

        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(jwt).expects('verify').once().callsArgWith(2, null, verifyResult);

        const result = await passportService.verify({ token, secret });
        assert(typeof result, 'object');
        sandbox.verify();
    });
});

describe('service.passport.currentIssueUnit()', () => {
    beforeEach(() => {
        sandbox.restore();
        process.env.WAITER_SECRET = 'secret';
    });

    afterEach(() => {
        delete process.env.WAITER_RULES;
        delete process.env.WAITER_PROJECTS;
    });

    it('規則が存在しなければ、NotFoundエラーになるはず', async () => {
        process.env.WAITER_RULES = JSON.stringify([]);
        process.env.WAITER_PROJECTS = JSON.stringify([]);
        const scope = 'scope';

        const projectRepo = new ProjectRepo();
        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        sandbox.mock(projectRepo).expects('findById').once().returns({});

        const result = await passportService.currentIssueUnit({
            project: { id: 'projectId' },
            scope: scope
        })({
            passportIssueUnit: passportCounterRepo,
            project: projectRepo,
            rule: ruleRepo
        }).catch((err) => err);
        assert(result instanceof factory.errors.NotFound);
        sandbox.verify();
    });

    it('RedisCacheが正常であれば、許可証発行リクエスト数を取得できるはず', async () => {
        const scope = 'scope';
        const project = { id: 'projectId' };
        process.env.WAITER_RULES = JSON.stringify([{
            project: { id: project.id },
            name: 'name',
            description: 'description',
            scope: scope,
            aggregationUnitInSeconds: 60,
            threshold: 100,
            unavailableHoursSpecifications: []
        }]);
        process.env.WAITER_PROJECTS = JSON.stringify([]);
        const incrResult = {
            identifier: 'scope:1508227500',
            validFrom: 1508227500,
            validThrough: 1508227800,
            numberOfRequests: 2
        };

        const projectRepo = new ProjectRepo();
        const ruleRepo = new RuleRepo();
        const passportCounterRepo = new PassportIssueUnitRepo(new redis({}));

        sandbox.mock(projectRepo).expects('findById').once().returns(project);
        sandbox.mock(passportCounterRepo).expects('now').once().resolves(incrResult);

        const result = await passportService.currentIssueUnit({
            project: { id: project.id },
            scope: scope
        })({
            passportIssueUnit: passportCounterRepo,
            project: projectRepo,
            rule: ruleRepo
        });
        assert(Number.isInteger(result.numberOfRequests));
        sandbox.verify();
    });
});

describe('service.passport.create()', () => {
    let TEST_CREATE_PARAMS: any;
    beforeEach(() => {
        TEST_CREATE_PARAMS = {
            scope: 'scope',
            iat: 1511059610,
            exp: 1511059910,
            iss: 'issuer',
            aud: 'audience',
            issueUnit: {
                identifier: 'scope:1508227500',
                validFrom: 1508227500,
                validThrough: 1508227800,
                numberOfRequests: 2
            }
        };
    });

    it('作成できる', () => {
        assert.doesNotThrow(() => {
            passportService.create(TEST_CREATE_PARAMS);
        });
    });

    it('発行日時が数字でなければArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.iat = '1511059610';
                passportService.create(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.Argument);

                return true;
            }
        );
    });

    it('期限が数字でなければArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.exp = '1511059610';
                passportService.create(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.Argument);

                return true;
            }
        );
    });

    it('スコープが空であればArgumentNullError', () => {
        assert.throws(
            () => {
                const params = { ...TEST_CREATE_PARAMS, ...{ scope: '' } };
                passportService.create(params);
            },
            (err: any) => {
                assert(err instanceof factory.errors.ArgumentNull);

                return true;
            }
        );
    });

    it('発行者が空であればArgumentNullError', () => {
        assert.throws(
            () => {
                const params = { ...TEST_CREATE_PARAMS, ...{ iss: '' } };
                passportService.create(params);
            },
            (err: any) => {
                assert(err instanceof factory.errors.ArgumentNull);

                return true;
            }
        );
    });

    it('発行単位がオブジェクトでなければArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.issueUnit = null;
                passportService.create(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.Argument);

                return true;
            }
        );
    });

    it('識別子が空であればArgumentNullError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.issueUnit.identifier = '';
                passportService.create(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.ArgumentNull);

                return true;
            }
        );
    });

    it('リクエスト数が数字でなければArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.issueUnit.numberOfRequests = '1';
                passportService.create(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.Argument);

                return true;
            }
        );
    });
});
