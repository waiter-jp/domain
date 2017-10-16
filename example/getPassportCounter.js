/**
 * 現在の許可証数取得サンプル
 * @ignore
 */

const waiter = require('../');

async function main() {
    const redisClient = new waiter.Redis({
        port: process.env.TEST_REDIS_PORT,
        host: process.env.TEST_REDIS_HOST,
        password: process.env.TEST_REDIS_KEY,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });

    const clientRepo = new waiter.repository.Client();
    const passportRepo = new waiter.repository.PassportCounter(redisClient);

    const clientId = 'clientId';
    const scope = 'scope';

    const counter = await waiter.service.passport.getCounter(clientId, scope)(clientRepo, passportRepo);
    console.log('counter is', counter);

    redisClient.quit();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
