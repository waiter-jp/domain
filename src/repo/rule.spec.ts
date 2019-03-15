// tslint:disable:no-implicit-dependencies
/**
 * 発行規則リポジトリテスト
 */
import * as assert from 'assert';
import * as mongoose from 'mongoose';
import * as sinon from 'sinon';
// tslint:disable-next-line:no-require-imports no-var-requires
require('sinon-mongoose');

import * as factory from '../factory';
import { InMemoryRepository as RuleInMemoryRepo, MongoRepository as RuleRepo } from '../repo/rule';

let sandbox: sinon.SinonSandbox;
before(() => {
    sandbox = sinon.createSandbox();
});

describe('RuleInMemoryRepo.constructor()', () => {
    beforeEach(() => {
        process.env.WAITER_RULES = JSON.stringify([{}]);
    });

    afterEach(() => {
        process.env.WAITER_RULES = JSON.stringify([{}]);
        sandbox.restore();
    });

    it('環境変数の設定がされていなければ、インスタンスを生成できないはず', async () => {
        delete process.env.WAITER_RULES;

        assert.throws(
            () => {
                // tslint:disable-next-line:no-unused-expression
                new RuleInMemoryRepo();
            },
            (err: any) => {
                assert(err instanceof Error);
                sandbox.verify();

                return true;
            }
        );
    });

    it('環境変数の設定が配列でなければ、インスタンスを生成できないはず', async () => {
        process.env.WAITER_RULES = JSON.stringify({});

        assert.throws(
            () => {
                // tslint:disable-next-line:no-unused-expression
                new RuleInMemoryRepo();
            },
            (err: any) => {
                assert(err instanceof Error);
                sandbox.verify();

                return true;
            }
        );
    });
});

describe('規則検索', () => {
    beforeEach(() => {
        process.env.WAITER_RULES = JSON.stringify([{
            project: { id: 'projectId' },
            client: [{ id: 'clientId' }],
            name: 'name',
            description: 'description',
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 100,
            availableHoursSpecifications: [],
            unavailableHoursSpecifications: []
        }]);
        sandbox.restore();
    });

    it('環境変数の設定がされていれば、配列が返されるはず', async () => {
        const searchCoditions = {
            project: { ids: ['projectId'] },
            client: { ids: ['clientId'] },
            scopes: ['scope']
        };

        const ruleRepo = new RuleInMemoryRepo();
        const result = ruleRepo.search(searchCoditions);
        assert(Array.isArray(result));
        sandbox.verify();
    });
});
describe('RuleInMemoryRepo.CREATE_FROM_OBJECT()', () => {
    let TEST_CREATE_PARAMS: any;
    beforeEach(() => {
        TEST_CREATE_PARAMS = {
            project: { id: 'projectId' },
            name: 'name',
            description: 'description',
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 100,
            availableHoursSpecifications: [
                {
                    startDate: '2017-11-10T09:00:00Z',
                    endDate: '2017-11-10T09:30:00Z'
                }
            ],
            unavailableHoursSpecifications: [
                {
                    startDate: '2017-11-10T09:00:00Z',
                    endDate: '2017-11-10T09:30:00Z'
                }
            ]
        };
    });

    it('作成できる', () => {
        assert.doesNotThrow(() => {
            RuleInMemoryRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
        });
    });

    it('nameが空であればArgumentNullError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.name = undefined;
                RuleInMemoryRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.ArgumentNull);

                return true;
            }
        );
    });

    it('descriptionが空であればArgumentNullError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.description = undefined;
                RuleInMemoryRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.ArgumentNull);

                return true;
            }
        );
    });

    it('scopeが空であればArgumentNullError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.scope = undefined;
                RuleInMemoryRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.ArgumentNull);

                return true;
            }
        );
    });

    it('aggregationUnitInSecondsが数字でなければArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.aggregationUnitInSeconds = <any>'1';
                RuleInMemoryRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.Argument);

                return true;
            }
        );
    });

    it('thresholdが数字でなければArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.threshold = <any>'1';
                RuleInMemoryRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.Argument);

                return true;
            }
        );
    });

    it('availableHoursSpecificationsが配列でなければArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.availableHoursSpecifications = {};
                RuleInMemoryRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.Argument);

                return true;
            }
        );
    });

    it('サービス利用可能期間の開始日時が不適切であればArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.availableHoursSpecifications[0].startDate = 'xxx';
                RuleInMemoryRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.Argument);

                return true;
            }
        );
    });

    it('サービス利用可能期間の終了日時が不適切であればArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.availableHoursSpecifications[0].endDate = 'xxx';
                RuleInMemoryRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.Argument);

                return true;
            }
        );
    });

    it('unavailableHoursSpecificationsが配列でなければArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.unavailableHoursSpecifications = {};
                RuleInMemoryRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.Argument);

                return true;
            }
        );
    });

    it('サービス休止時間帯の開始日時が不適切であればArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.unavailableHoursSpecifications[0].startDate = 'xxx';
                RuleInMemoryRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.Argument);

                return true;
            }
        );
    });

    it('サービス休止時間帯の終了日時が不適切であればArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.unavailableHoursSpecifications[0].endDate = 'xxx';
                RuleInMemoryRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.Argument);

                return true;
            }
        );
    });

    it('プロジェクト属性が存在しなければArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.project = undefined;
                RuleInMemoryRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.ArgumentNull);

                return true;
            }
        );
    });

    it('クライアントが配列でなければArgumentError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.client = {};
                RuleInMemoryRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.Argument);

                return true;
            }
        );
    });
});

describe('MongoDBで規則検索', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('MongoDBが正常であれば配列が返るはず', async () => {
        const rules = [{}];

        const ruleRepo = new RuleRepo(mongoose.connection);

        sandbox.mock(ruleRepo.ruleModel)
            .expects('find')
            .once()
            .chain('exec')
            .resolves(rules.map((a) => new ruleRepo.ruleModel(a)));

        const result = await ruleRepo.search({
            limit: 1,
            page: 1,
            sort: {}
        });
        assert(Array.isArray(result));
        sandbox.verify();
    });
});
