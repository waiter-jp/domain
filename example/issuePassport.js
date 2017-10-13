/**
 * 許可証発行サンプル
 * @ignore
 */

const waiter = require('../');

async function main() {
    const redisClient = waiter.redis.createClient({
        host: process.env.TEST_REDIS_HOST,
        port: process.env.TEST_REDIS_PORT,
        password: process.env.TEST_REDIS_KEY,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });

    const clientRepo = new waiter.repository.Client();
    const passportRepo = new waiter.repository.PassportCounter(redisClient);

    const clientId = 'clientId';
    const scope = 'scope';

    const passport = await waiter.service.passport.issueWithRedis(clientId, scope)(clientRepo, passportRepo);
    console.log('passport is', passport);

    redisClient.quit();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
