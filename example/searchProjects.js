const mongoose = require('mongoose');
const waiter = require('../');

async function main() {
    await mongoose.connect(process.env.MONGOLAB_URI);

    const projectRepo = new waiter.repository.Project(mongoose.connection);
    const projects = await projectRepo.search({});
    console.log('projects are', projects);
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
