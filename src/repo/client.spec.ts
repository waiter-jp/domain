/**
 * クライアントレポジトリーテスト
 * @ignore
 */

import * as assert from 'assert';
import * as sinon from 'sinon';

// import * as errors from '../factory/errors';
import { InMemoryRepository as ClientRepo } from '../repo/client';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('ClientRepo.constructor()', () => {
    beforeEach(() => {
        // no op
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('環境変数の設定がされていなければ、インスタンスを生成できないはず', async () => {
        delete process.env.WAITER_CLIENTS;

        assert.throws(
            () => {
                // tslint:disable-next-line:no-unused-expression
                new ClientRepo();
            },
            (err: any) => {
                assert(err instanceof Error);
                sandbox.verify();

                return true;
            }
        );
    });

    it('環境変数の設定が配列でなければ、インスタンスを生成できないはず', async () => {
        process.env.WAITER_CLIENTS = JSON.stringify({});

        assert.throws(
            () => {
                // tslint:disable-next-line:no-unused-expression
                new ClientRepo();
            },
            (err: any) => {
                assert(err instanceof Error);
                sandbox.verify();

                return true;
            }
        );
    });
});
