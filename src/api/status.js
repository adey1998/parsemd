const express = require('express')
const JobModel = require('../models/Job')

const router = express.Router()

router.get('/status/:jobId', async (req, res) => {
    const { jobId } = req.params

    try {
        const job = await JobModel.findById(jobId).lean()

        if (!job) {
            return res.status(404).json({ error: "Job not found" })
        }

        res.status(200).json({
            jobId: job._id,
            status: job.status,
            createdAt: job.createdAt,
            completedAt: job.completedAt || null
        })
    } catch (err) {
        console.error("Status error:", err)
        res.status(500).json({ error: "Internal server error" })
    }
})

module.exports = router