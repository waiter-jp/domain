const mongoose = require('mongoose');
const waiter = require('../');

const rules = require('./rules');

async function main() {
    await mongoose.connect(process.env.MONGOLAB_URI);

    const ruleRepo = new waiter.repository.Rule(mongoose.connection);
    await ruleRepo.ruleModel.create(rules);

    // await mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
