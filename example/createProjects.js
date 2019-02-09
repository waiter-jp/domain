const mongoose = require('mongoose');
const waiter = require('../');

const projects = require('./projects');

async function main() {
    await mongoose.connect(process.env.MONGOLAB_URI);

    const projectRepo = new waiter.repository.Project(mongoose.connection);
    await projectRepo.projectModel.create(projects);

    // await mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
