// tslint:disable:no-implicit-dependencies
/**
 * キャッシュサービステスト
 */
import * as assert from 'assert';
import * as mongoose from 'mongoose';
import * as sinon from 'sinon';

import { MongoRepository as RuleRepo } from '../repo/rule';
import * as CacheService from '../service/cache';

let sandbox: sinon.SinonSandbox;
before(() => {
    sandbox = sinon.createSandbox();
});

describe('インメモリデータストアを初期化する', () => {
    beforeEach(() => {
        sandbox.restore();

        // delete process.env.WAITER_PROJECTS;
        delete process.env.WAITER_RULES;
    });

    afterEach(() => {
        // delete process.env.WAITER_PROJECTS;
        delete process.env.WAITER_RULES;
    });

    it('リポジトリが正常であれは成功するはず', async () => {
        const ruleRepo = new RuleRepo(mongoose.connection);

        sandbox.mock(ruleRepo)
            .expects('search')
            .once()
            .resolves([{}]);

        await CacheService.initializeInMemoryDataStore()({
            rule: ruleRepo
        });
        // assert(typeof process.env.WAITER_PROJECTS === 'string');
        assert(typeof process.env.WAITER_RULES === 'string');
        sandbox.verify();
    });
});
