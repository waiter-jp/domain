/**
 * 現在の許可証数取得サンプル
 */
const waiter = require('../');

async function main() {
    const redisClient = new waiter.redis({
        port: process.env.TEST_REDIS_PORT,
        host: process.env.TEST_REDIS_HOST,
        password: process.env.TEST_REDIS_KEY
    });

    const projectRepo = new waiter.repository.Project();
    const ruleRepo = new waiter.repository.Rule();
    const passportIssueUnitRepo = new waiter.repository.PassportIssueUnit(redisClient);

    const scope = 'scope';

    const issueUnit = await waiter.service.passport.currentIssueUnit({
        project: { id: 'cinerino' },
        scope: scope
    })({
        passportIssueUnit: passportIssueUnitRepo,
        project: projectRepo,
        rule: ruleRepo
    });
    console.log('current issueUnit is', issueUnit);

    redisClient.quit();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
