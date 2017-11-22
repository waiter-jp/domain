/**
 * 許可証発行サンプル
 * @ignore
 */

const waiter = require('../');

async function main() {
    const redisClient = new waiter.redis({
        port: process.env.TEST_REDIS_PORT,
        host: process.env.TEST_REDIS_HOST,
        password: process.env.TEST_REDIS_KEY
    });

    const ruleRepo = new waiter.repository.Rule();
    const passportIssueUnitRepo = new waiter.repository.PassportIssueUnit(redisClient);

    const scope = 'scope';

    const passport = await waiter.service.passport.issue(scope)(ruleRepo, passportIssueUnitRepo);
    console.log('passport is', passport);

    redisClient.quit();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
