const mongoose = require('mongoose')

const JobSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    status: {
        type: String,
        enum: ["queued", "processing", "complete", "failed"],
        default: "queued"
    },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    result: { type: mongoose.Schema.Types.Mixed }, //anything goes (no specific structure)
    error: { type: String }
})

//TTL index to auto-delete jobs after 7 days
JobSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 })

const JobModel = mongoose.model("Job", JobSchema)
module.exports = JobModel