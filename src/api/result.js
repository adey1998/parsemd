const express = require('express')
const JobModel = require('../models/Job')

const router = express.Router()

router.get('/result/:jobId', async (req, res) => {
    const { jobId } = req.params

    try {
        const job = await JobModel.findById(jobId).lean()

        if (!job) {
            return res.status(404).json({ error: "Job not found" })
        }

        if (job.status === 'failed') {
            return res.status(400).json({
                status: job.status,
                error: job.error || 'Unknown processing error'
            })
        }

        if (job.status !== 'complete') {
            return res.status(202).json({ message: "Job is not complete yet" })
        }

        return res.status(200).json({
            jobId: job._id,
            result: job.result,
            completedAt: job.completedAt
        })
    } catch (err) {
        console.error("Error fetching result:", err)
        return res.status(500).json({ error: "Internal server error" })
    }
})

module.exports = router