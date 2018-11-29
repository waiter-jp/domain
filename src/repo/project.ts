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
