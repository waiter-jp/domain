import { Connection, Model } from 'mongoose';

import { modelName } from './mongoose/model/project';

import * as factory from '../factory';

/**
 * プロジェクトリポジトリ
 */
export class InMemoryRepository {
    public readonly projectsFromJson: factory.project.IProject[];

    constructor() {
        try {
            // 環境変数からルールを取得する
            const rules = JSON.parse(<string>process.env.WAITER_PROJECTS);
            if (!Array.isArray(rules)) {
                throw new factory.errors.Argument('WAITER_PROJECTS', 'WAITER_PROJECTS must be an array');
            }

            this.projectsFromJson = rules.map(InMemoryRepository.CREATE_FROM_OBJECT);
        } catch (error) {
            throw new factory.errors.Argument(
                'WAITER_PROJECTS',
                `Please set an environment variable \`WAITER_PROJECTS\` correctly. ${error.message}`
            );
        }
    }

    public static CREATE_FROM_OBJECT(params: any): factory.project.IProject {
        return params;
    }

    /**
     * IDで検索
     */
    public findById(params: { id: string }): factory.project.IProject {
        const project = this.projectsFromJson.find((p) => p.id === params.id);
        if (project === undefined) {
            throw new factory.errors.NotFound('Project');
        }

        return project;
    }
}

/**
 * MongoDBリポジトリ
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
export class MongoRepository {
    public readonly projectModel: typeof Model;

    constructor(connection: Connection) {
        this.projectModel = connection.model(modelName);
    }

    public async search(params: any): Promise<any[]> {
        const conditions = [
            { _id: { $exists: true } }
        ];
        const query = this.projectModel.find(
            { $and: conditions },
            {
                __v: 0,
                createdAt: 0,
                updatedAt: 0
            }
        );
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (params.limit !== undefined && params.page !== undefined) {
            query.limit(params.limit)
                .skip(params.limit * (params.page - 1));
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (params.sort !== undefined) {
            query.sort(params.sort);
        }

        return query.setOptions({ maxTimeMS: 10000 })
            .exec()
            .then((docs) => docs.map((doc) => doc.toObject()));
    }
}
