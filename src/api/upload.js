const express = require('express')
const multer = require('multer')
const JobModel = require('../models/Job')
const referralQueue = require('../services/queue')
const uploadLimiter = require('../middleware/rateLimiter')

const router = express.Router()

const upload = multer({ dest: 'uploads/' })

router.post('/upload', uploadLimiter, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" })
        }

        const originalName = req.file.originalname
        const tempPath = req.file.path

        //save job in mongo
        const job = await JobModel.create({
            fileName: originalName,
            status: "queued"
        })

        //push job into queue
        await referralQueue.add("process-referral", {
            jobId: job._id.toString(),
            filePath: tempPath
        }, 
        { 
            attempts: 3, //max 3 tries
            backoff: {
                type: 'exponential', //wait longer each time
                delay: 2000 //starts with 2s delay
            },
            removeOnComplete: true,
            removeOnFail: false 
        })

        console.log(`Queued job: ${job._id} (${originalName})`)

        res.status(200).json({
            jobId: job._id,
            status: job.status
        })
    }
    catch (err) {
        console.error("Upload error:", err)
        res.status(500).json({ error: "Upload failed" })
    }
})

module.exports = router
