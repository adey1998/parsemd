const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const uploadRoute = require('./api/upload')
const statusRoute = require('./api/status')
const resultRoute = require('./api/result')
const { ExpressAdapter } = require('@bull-board/express')
const { createBullBoard } = require('@bull-board/api')
const { BullMQAdapter } = require('@bull-board/api/dist/src/queueAdapters/bullMQ')
const referralQueue = require('./services/queue')

//Bull Board UI (real-time web UI to see job progress/failures/retry/delay)
const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/queues')

createBullBoard({
    queues: [new BullMQAdapter(referralQueue)],
    serverAdapter
})

dotenv.config()

const app = express()
app.use(express.json())

//upload route
app.use('/api', uploadRoute)

//get status
app.use('/api', statusRoute)

//get result
app.use('/api', resultRoute)

//Bull Board dashboard
app.use('/admin/queues', serverAdapter.getRouter())

const PORT = process.env.PORT || 3000
const MONGO_URI = process.env.MONGO_URI || ""

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected")
        app.listen(PORT, () => {
            console.log(`ParseMD API running on port ${PORT}`)
        })
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err)
    })