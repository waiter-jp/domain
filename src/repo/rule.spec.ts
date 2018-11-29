// tslint:disable:no-implicit-dependencies
/**
 * 発行規則リポジトリテスト
 */
import * as assert from 'assert';
import * as sinon from 'sinon';

import * as factory from '../factory';
import { InMemoryRepository as RuleRepo } from '../repo/rule';

let sandbox: sinon.SinonSandbox;
before(() => {
    sandbox = sinon.sandbox.create();
});

describe('RuleRepo.constructor()', () => {
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
                new RuleRepo();
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
                new RuleRepo();
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

        const ruleRepo = new RuleRepo();
        const result = ruleRepo.search(searchCoditions);
        assert(Array.isArray(result));
        sandbox.verify();
    });
});
describe('RuleRepo.CREATE_FROM_OBJECT()', () => {
    let TEST_CREATE_PARAMS: any;
    beforeEach(() => {
        TEST_CREATE_PARAMS = {
            project: { id: 'projectId' },
            name: 'name',
            description: 'description',
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 100,
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
            RuleRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
        });
    });

    it('nameが空であればArgumentNullError', () => {
        assert.throws(
            () => {
                TEST_CREATE_PARAMS.name = undefined;
                RuleRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
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
                RuleRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
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
                RuleRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
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
                RuleRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
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
                RuleRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
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
                RuleRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
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
                RuleRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
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
                RuleRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
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
                RuleRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
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
                RuleRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
            },
            (err: any) => {
                assert(err instanceof factory.errors.Argument);

                return true;
            }
        );
    });
});
