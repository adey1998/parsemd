const { Queue } = require('bullmq')
const IORedis = require('ioredis')

//Redis connection — default localhost:6379
const connection = new IORedis({
    maxRetriesPerRequest: null,
});

//create named queue
const referralQueue = new Queue("referralJobs", {
    connection
})

module.exports = referralQueue