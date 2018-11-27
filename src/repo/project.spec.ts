// tslint:disable:no-implicit-dependencies
/**
 * プロジェクトリポジトリテスト
 */
import * as assert from 'assert';
import * as sinon from 'sinon';

import { InMemoryRepository as ProjectRepo } from '../repo/project';

let sandbox: sinon.SinonSandbox;
before(() => {
    sandbox = sinon.sandbox.create();
});

describe('ProjectRepo.constructor()', () => {
    beforeEach(() => {
        process.env.WAITER_PROJECTS = JSON.stringify([{}]);
    });

    afterEach(() => {
        process.env.WAITER_PROJECTS = JSON.stringify([{}]);
        sandbox.restore();
    });

    it('環境変数の設定がされていなければ、インスタンスを生成できないはず', async () => {
        delete process.env.WAITER_PROJECTS;

        assert.throws(
            () => {
                // tslint:disable-next-line:no-unused-expression
                new ProjectRepo();
            },
            (err: any) => {
                assert(err instanceof Error);
                sandbox.verify();

                return true;
            }
        );
    });

    it('環境変数の設定が配列でなければ、インスタンスを生成できないはず', async () => {
        process.env.WAITER_PROJECTS = JSON.stringify({});

        assert.throws(
            () => {
                // tslint:disable-next-line:no-unused-expression
                new ProjectRepo();
            },
            (err: any) => {
                assert(err instanceof Error);
                sandbox.verify();

                return true;
            }
        );
    });
});

describe('ProjectRepo.CREATE_FROM_OBJECT()', () => {
    let TEST_CREATE_PARAMS: any;
    beforeEach(() => {
        TEST_CREATE_PARAMS = {
            id: 'projectId'
        };
    });

    it('作成できる', () => {
        assert.doesNotThrow(() => {
            ProjectRepo.CREATE_FROM_OBJECT(TEST_CREATE_PARAMS);
        });
    });
});
