import * as createDebug from 'debug';
import * as moment from 'moment';
import * as validator from 'validator';

import * as factory from '../factory';

const debug = createDebug('waiter-domain:repository');

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

    public static CREATE_FROM_OBJECT(params: any): factory.rule.IRule {
        if (typeof params.project !== 'object' || typeof params.project.id !== 'string' || validator.isEmpty(params.project.id)) {
            throw new factory.errors.ArgumentNull('project');
        }
        if (typeof params.name !== 'string' || validator.isEmpty(params.name)) {
            throw new factory.errors.ArgumentNull('name');
        }
        if (typeof params.description !== 'string' || validator.isEmpty(params.description)) {
            throw new factory.errors.ArgumentNull('description');
        }
        if (typeof params.scope !== 'string' || validator.isEmpty(params.scope)) {
            throw new factory.errors.ArgumentNull('scope');
        }
        if (!Number.isInteger(params.aggregationUnitInSeconds)) {
            throw new factory.errors.Argument('aggregationUnitInSeconds', 'aggregationUnitInSeconds must be number.');
        }
        if (!Number.isInteger(params.threshold)) {
            throw new factory.errors.Argument('threshold', 'threshold must be number.');
        }
        if (!Array.isArray(params.unavailableHoursSpecifications)) {
            throw new factory.errors.Argument('unavailableHoursSpecifications', 'unavailableHoursSpecifications must be an array.');
        }
        params.unavailableHoursSpecifications.forEach((unavailableHoursSpecification: any) => {
            if (!moment(unavailableHoursSpecification.startDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid()) {
                throw new factory.errors.Argument(
                    'unavailableHoursSpecification.startDate',
                    'unavailableHoursSpecification.startDate must be Date.'
                );
            }
            if (!moment(unavailableHoursSpecification.endDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid()) {
                throw new factory.errors.Argument(
                    'unavailableHoursSpecification.endDate',
                    'unavailableHoursSpecification.endDate must be Date.'
                );
            }
        });

        return {
            project: { id: params.project.id },
            name: params.name,
            description: params.description,
            scope: params.scope,
            aggregationUnitInSeconds: params.aggregationUnitInSeconds,
            threshold: params.threshold,
            unavailableHoursSpecifications: params.unavailableHoursSpecifications.map((unavailableHoursSpecification: any) => {
                return {
                    startDate: moment(unavailableHoursSpecification.startDate, 'YYYY-MM-DDTHH:mm:ssZ').toDate(),
                    endDate: moment(unavailableHoursSpecification.endDate, 'YYYY-MM-DDTHH:mm:ssZ').toDate()
                };
            })
        };
    }

    /**
     * 検索
     */
    public search(params: factory.rule.ISearchConditions): factory.rule.IRule[] {
        let rules = this.rulesFromJson;

        if (params.project !== undefined) {
            if (Array.isArray(params.project.ids)) {
                const projectIds = params.project.ids;
                rules = rules.filter((rule) => projectIds.indexOf(rule.project.id) >= 0);
            }
        }

        return rules;
    }

    /**
     * スコープでルールを取得する
     */
    public findByScope(params: {
        project: { id: string };
        scope: string;
    }): factory.rule.IRule {
        debug('finding a rule...', params.scope);
        const ruleFromJson = this.rulesFromJson.find(
            (rule) => rule.project.id === params.project.id && rule.scope === params.scope
        );
        if (ruleFromJson === undefined) {
            throw new factory.errors.NotFound('Rule');
        }
        debug('rule found.', ruleFromJson);

        return ruleFromJson;
    }
}
