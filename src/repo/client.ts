import * as createDebug from 'debug';

import * as clientFactory from '../factory/client';
import * as errors from '../factory/errors';

const debug = createDebug('waiter-domain:repository:client');

/**
 * クライアントローカルレポジトリー
 * 環境変数でクライアントを管理する場合のリポジトリークラス
 * @export
 * @class
 */
export class InMemoryRepository {
    public readonly clientsFromJson: clientFactory.IClient[];

    constructor() {
        try {
            // 環境変数からクライアントリストを取得する
            const clients = JSON.parse(<string>process.env.WAITER_CLIENTS);
            if (!Array.isArray(clients)) {
                throw new Error('WAITER_CLIENTS must be an array.');
            }

            this.clientsFromJson = clients;
        } catch (error) {
            throw new Error(`Please set an environment variable \`WAITER_CLIENTS\` correctly. ${error.message}`);
        }
    }

    public findbyId(clientId: string): clientFactory.IClient {
        debug('finding a client...', clientId);
        const clientFromJson = this.clientsFromJson.find((client) => client.id === clientId);
        if (clientFromJson === undefined) {
            throw new errors.NotFound('client');
        }

        return clientFactory.create(clientFromJson);
    }
}
