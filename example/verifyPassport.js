/**
 * 許可証検証サンプル
 */
const readline = require('readline');
const waiter = require('../');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Please enter an token:\n', async (token) => {
    const secret = 'secret';

    try {
        const passport = await waiter.service.passport.verify({
            token: token, secret: secret
        });
        console.log('passport is', passport);
    } catch (error) {
        console.error(error);
    }

    rl.close();
});
