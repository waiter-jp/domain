/**
 * 許可証検証サンプル
 * @ignore
 */

const readline = require('readline');
const waiter = require('../');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Please enter an token:\n', async (token) => {
    const secret = 'clientSecret';

    try {
        const passport = await waiter.service.passport.verify(token, secret);
        console.log('passport is', passport);
    } catch (error) {
        console.error(error);
    }

    rl.close();
});
