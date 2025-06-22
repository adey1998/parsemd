const fs = require('fs')
const pdfParse = require('pdf-parse')
const queue = require('../services/queue')
const JobModel = require('../models/Job')

function extractMedicalData(text) {
    const nameMatch = text.match(/Referral for:\s*(.+)/i)
    const dobMatch = text.match(/DOB:\s*([0-9/]+)/i)
    const reasonMatch = text.match(/Reason:\s*(.+)/i)
    const reasonText = reasonMatch?.[1] || ""
    const symptomsMatch = reasonText.match(/(Shortness of breath|Cough|Wheezing|Fatigue|Chest pain|.*?)/i)

    return {
        patientName: nameMatch?.[1] || null,
        dob: dobMatch?.[1] || null,
        symptoms: symptomsMatch?.[1] || null,
        referralReason: reasonText || null,
        rawPreview: text.slice(0, 300) // keep fallback preview
    }
}

async function processJob(job) {
    const { jobId, filePath } = job.data

    // throw new Error("Artificial failure for testing retries")

    try {
        //mark job as processing
        await JobModel.findByIdAndUpdate(jobId, { status: "processing" })
        await job.updateProgress(10)

        //read pdf
        const fileBuffer = fs.readFileSync(filePath)
        await job.updateProgress(30)

        //get data from pdf
        const data = await pdfParse(fileBuffer)
        await job.updateProgress(60)

        //extracting structured data
        const extracted = extractMedicalData(data.text)
        await job.updateProgress(90)

        //upddate db with status & data
        await JobModel.findByIdAndUpdate(jobId, {
            status: "complete",
            completedAt: new Date(),
            result: extracted
        })
        await job.updateProgress(100)
    } catch (err) {
        console.error(`Job ${jobId} failed`, err)

        await JobModel.findByIdAndUpdate(jobId, {
            status: "failed",
            error: err.message
        })

        throw err
    }
}

module.exports = processJob