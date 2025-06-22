const mongoose = require('mongoose')
const dotenv = require('dotenv')
const processJob = require('./processor')
const IORedis = require('ioredis')
const { Worker } = require('bullmq')

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || ""
const connection = new IORedis({
    maxRetriesPerRequest: null
})

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("Worker connected to MongoDB")

        //create BullMQ worker
        const worker = new Worker(
            "referralJobs", //same name as queue
            async (job) => {
                console.log(`Processing Job ID: ${job.id}`)
                console.log(`Attempt #: ${job.attemptsMade}`)
                console.log('Job Data:', job.data)

                await processJob(job)
            },
            { connection }
        )

        worker.on('completed', (job) => {
            console.log(`Job ${job.id} completed`)
        })

        worker.on('failed', (job, err) => {
            console.log(`Job ${job.id} failed: ${err.message}`)
        })
    })
    .catch((err) => {
        console.log("Worker MongoDB error:", err)
    })