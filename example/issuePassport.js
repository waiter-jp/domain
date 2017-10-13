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

    const repository = new waiter.repository.PassportCounter(redisClient);

    const client = {
        id: 'clientid',
        secret: 'clientsecret',
        passport_issuer_work_shift_in_sesonds: 60,
        total_number_of_passports_per_issuer: 100
    };
    const scope = 'scope';

    const passport = await waiter.service.passport.issueWithRedis(client, scope)(repository);
    console.log('passport is', passport);

    redisClient.quit();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
