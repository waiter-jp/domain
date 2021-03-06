import * as moment from 'moment';
import { Connection, Model } from 'mongoose';

import { modelName } from './mongoose/model/rule';

import * as factory from '../factory';

/**
 * 許可証発行ルールローカルリポジトリ
 * 環境変数で許可証発行ルールを管理する場合のリポジトリークラス
 */
export class InMemoryRepository {
    public readonly rulesFromJson: factory.rule.IRule[];

    constructor() {
        try {
            // 環境変数からルールを取得する
            const rules = JSON.parse(<string>process.env.WAITER_RULES);
            if (!Array.isArray(rules)) {
                throw new Error('WAITER_RULES must be an array.');
            }

            this.rulesFromJson = rules.map(InMemoryRepository.CREATE_FROM_OBJECT);
        } catch (error) {
            throw new Error(`Please set an environment variable \`WAITER_RULES\` correctly. ${error.message}`);
        }
    }

    // tslint:disable-next-line:cyclomatic-complexity max-func-body-length
    public static CREATE_FROM_OBJECT(params: any): factory.rule.IRule {
        if (typeof params.project?.id !== 'string' || params.project.id.length === 0) {
            throw new factory.errors.ArgumentNull('project.id');
        }
        if (params.client !== undefined && !Array.isArray(params.client)) {
            throw new factory.errors.Argument('client', 'client must be an array');
        }
        if (typeof params.name !== 'string' || params.name.length === 0) {
            throw new factory.errors.ArgumentNull('name');
        }
        if (typeof params.description !== 'string' || params.description.length === 0) {
            throw new factory.errors.ArgumentNull('description');
        }
        if (typeof params.scope !== 'string' || params.scope.length === 0) {
            throw new factory.errors.ArgumentNull('scope');
        }
        if (typeof params.aggregationUnitInSeconds !== 'number') {
            throw new factory.errors.Argument('aggregationUnitInSeconds', 'aggregationUnitInSeconds must be number');
        }
        if (typeof params.threshold !== 'number') {
            throw new factory.errors.Argument('threshold', 'threshold must be number.');
        }

        // 利用不可期間リストは、配列or未指定
        if (!Array.isArray(params.availableHoursSpecifications) && params.availableHoursSpecifications !== undefined) {
            throw new factory.errors.Argument('availableHoursSpecifications', 'availableHoursSpecifications must be an array');
        }

        // 利用不可期間リストは、配列or未指定
        if (!Array.isArray(params.unavailableHoursSpecifications) && params.unavailableHoursSpecifications !== undefined) {
            throw new factory.errors.Argument('unavailableHoursSpecifications', 'unavailableHoursSpecifications must be an array');
        }

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (Array.isArray(params.availableHoursSpecifications)) {
            params.availableHoursSpecifications.forEach((spec: any) => {
                if (!moment(spec.startDate, 'YYYY-MM-DDTHH:mm:ssZ')
                    .isValid()) {
                    throw new factory.errors.Argument(
                        'availableHoursSpecification.startDate',
                        'availableHoursSpecification.startDate must be Date.'
                    );
                }
                if (!moment(spec.endDate, 'YYYY-MM-DDTHH:mm:ssZ')
                    .isValid()) {
                    throw new factory.errors.Argument(
                        'availableHoursSpecification.endDate',
                        'availableHoursSpecification.endDate must be Date.'
                    );
                }
            });
        }

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (Array.isArray(params.unavailableHoursSpecifications)) {
            params.unavailableHoursSpecifications.forEach((spec: any) => {
                if (!moment(spec.startDate, 'YYYY-MM-DDTHH:mm:ssZ')
                    .isValid()) {
                    throw new factory.errors.Argument(
                        'unavailableHoursSpecification.startDate',
                        'unavailableHoursSpecification.startDate must be Date.'
                    );
                }
                if (!moment(spec.endDate, 'YYYY-MM-DDTHH:mm:ssZ')
                    .isValid()) {
                    throw new factory.errors.Argument(
                        'unavailableHoursSpecification.endDate',
                        'unavailableHoursSpecification.endDate must be Date.'
                    );
                }
            });
        }

        return {
            project: { id: params.project.id },
            client: params.client,
            name: params.name,
            description: params.description,
            scope: params.scope,
            aggregationUnitInSeconds: params.aggregationUnitInSeconds,
            threshold: params.threshold,
            availableHoursSpecifications: (Array.isArray(params.availableHoursSpecifications))
                ? params.availableHoursSpecifications.map((spec: any) => {
                    return {
                        startDate: moment(spec.startDate, 'YYYY-MM-DDTHH:mm:ssZ')
                            .toDate(),
                        endDate: moment(spec.endDate, 'YYYY-MM-DDTHH:mm:ssZ')
                            .toDate()
                    };
                })
                : /* istanbul ignore next */ undefined,
            unavailableHoursSpecifications: Array.isArray(params.unavailableHoursSpecifications)
                ? params.unavailableHoursSpecifications.map((spec: any) => {
                    return {
                        startDate: moment(spec.startDate, 'YYYY-MM-DDTHH:mm:ssZ')
                            .toDate(),
                        endDate: moment(spec.endDate, 'YYYY-MM-DDTHH:mm:ssZ')
                            .toDate()
                    };
                })
                : /* istanbul ignore next */ undefined
        };
    }

    /**
     * 検索
     */
    public search(params: factory.rule.ISearchConditions): factory.rule.IRule[] {
        let rules = this.rulesFromJson;

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (params.project !== undefined) {
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (Array.isArray(params.project.ids)) {
                const projectIds = params.project.ids;
                rules = rules.filter((rule) => projectIds.indexOf(rule.project.id) >= 0);
            }
        }

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (params.client !== undefined) {
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (Array.isArray(params.client.ids)) {
                const clientIds = params.client.ids;
                rules = rules.filter((rule) => {
                    // tslint:disable-next-line:no-single-line-block-comment
                    /* istanbul ignore if */
                    if (rule.client === undefined) {
                        return false;
                    }
                    const clientIds4rule = rule.client.map((r) => r.id);

                    return clientIds.some((clientId) => clientIds4rule.indexOf(clientId) >= 0);
                });
            }
        }

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (Array.isArray(params.scopes)) {
            const scopes = params.scopes;
            rules = rules.filter((rule) => scopes.indexOf(rule.scope) >= 0);
        }

        return rules;
    }
}

/**
 * MongoDBリポジトリ
 */
export class MongoRepository {
    public readonly ruleModel: typeof Model;

    constructor(connection: Connection) {
        this.ruleModel = connection.model(modelName);
    }

    public async search(params: any): Promise<any[]> {
        const conditions = [
            { _id: { $exists: true } }
        ];

        const query = this.ruleModel.find(
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
