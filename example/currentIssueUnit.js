/**
 * 現在の許可証数取得サンプル
 * @ignore
 */

const waiter = require('../');

async function main() {
    const redisClient = new waiter.Redis({
        port: process.env.TEST_REDIS_PORT,
        host: process.env.TEST_REDIS_HOST,
        password: process.env.TEST_REDIS_KEY
    });

    const clientRepo = new waiter.repository.Client();
    const passportIssueUnitRepo = new waiter.repository.PassportIssueUnit(redisClient);

    const clientId = 'clientId';
    const scope = 'scope';

    const issueUnit = await waiter.service.passport.currentIssueUnit(clientId, scope)(clientRepo, passportIssueUnitRepo);
    console.log('current issueUnit is', issueUnit);

    redisClient.quit();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
