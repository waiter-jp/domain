/**
 * 発行規則レポジトリーテスト
 * @ignore
 */

import * as assert from 'assert';
import * as sinon from 'sinon';

import { InMemoryRepository as RuleRepo } from '../repo/rule';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('RuleRepo.constructor()', () => {
    beforeEach(() => {
        process.env.WAITER_RULES = JSON.stringify([{}]);
        // no op
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

describe('RuleRepo.findAll()', () => {
    beforeEach(() => {
        process.env.WAITER_RULES = JSON.stringify([{
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 100,
            unavailableHoursSpecifications: []
        }]);
        // no op
    });

    afterEach(() => {
        process.env.WAITER_RULES = JSON.stringify([{
            scope: 'scope',
            aggregationUnitInSeconds: 60,
            threshold: 100,
            unavailableHoursSpecifications: []
        }]);
        sandbox.restore();
    });

    it('環境変数の設定がされていれば、配列が返されるはず', async () => {
        // tslint:disable-next-line:no-unused-expression
        const ruleRepo = new RuleRepo();
        const result = ruleRepo.findAll();
        assert(Array.isArray(result));
        sandbox.verify();
    });
});
