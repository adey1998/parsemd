# ParseMD – Async Medical Referral Processing API

A production-ready backend microservice for **asynchronously processing medical referral PDFs**. Designed to simulate real-world healthcare workflows — where scanned or digital referrals must be parsed into structured clinical metadata in the background.

Built with **Node.js**, **MongoDB**, **Redis**, and **BullMQ**, this architecture is modular, resilient, and scalable.



## 🚀 Features

- **PDF Upload API** – Upload medical referral documents via REST  
- **Redis + BullMQ Queue** – Fast, reliable job queue with built-in retry & backoff  
- **Background Worker** – Independent worker parses PDFs asynchronously  
- **Clinical Data Extraction** – Extracts patient name, DOB, symptoms, and referral reason using regex  
- **MongoDB Storage** – Durable job tracking with automatic TTL cleanup after 7 days  
- **Bull Board Dashboard** – Real-time job lifecycle monitoring (progress, retries, failures)  
- **Rate Limiting Middleware** – Upload protection via Express middleware  
- **Progress Tracking** – Live `.updateProgress()` updates throughout parsing  
- **Modular Architecture** – Decoupled components (API, worker, queue, models)  
- **Extensible** – Ready for NLP, ICD-10 mapping, LLM pipelines, or search integration



## 🧠 Architecture Overview

- **Asynchronous Processing** – Uploads return instantly while workers handle PDF parsing in the background  
- **Decoupled Job Flow** – Stateless API queues jobs, while workers handle stateful processing  
- **Durable Job State** – MongoDB tracks status, result, and errors  
- **Auto-Cleanup** – TTL index removes completed jobs after 7 days  
- **Pluggable Extraction Logic** – Easily upgrade regex with clinical NLP or LLM tools  
- **Fault Tolerance** – Built-in retry logic, fail tracking, and safe re-processing  
- **Observability** – Visual queue dashboard via Bull Board



## 🧱 Tech Stack

| Layer       | Technology            |
| ----------- | --------------------- |
| API Layer   | Node.js, Express      |
| Job Queue   | Redis, BullMQ         |
| Data Store  | MongoDB, Mongoose     |
| PDF Parsing | pdf-parse             |
| Dashboard   | Bull Board            |



## 🧩 Architectural Pattern

**Asynchronous Worker Queue Pattern**

- **Stateless API Server** – Handles upload and queues work to Redis  
- **Stateful Background Worker** – Processes jobs from the queue, manages state and retries  
- Enables:
  - Non-blocking API responses
  - Fault isolation and retry
  - Easy horizontal scaling



## 🔌 API Endpoints

### `POST /api/upload`

Upload a PDF. Returns job ID and initial status.

```json
{
  "jobId": "abc123",
  "status": "queued"
}

```

### `GET /api/status/:jobId`

Returns job status:

```json
{
  "status": "processing"
}
```

### `GET /api/result/:jobId`

Returns result if complete:

```json
{
  "jobId": "abc123",
  "result": {
    "patientName": "Maria Gomez",
    "dob": "02/14/1974",
    "referralReason": "Shortness of breath...",
    "rawPreview": "Referral for: Maria Gomez..."
  },
  "completedAt": "2025-06-22T03:45:00.123Z"
}
```

If job is not ready:

```json
{ "message": "Job is not complete yet" }
```

If job failed:

```json
{
  "status": "failed",
  "error": "Parsing error: Unexpected token..."
}
```



## ⚙️ Getting Started

```bash
git clone https://github.com/yourusername/async-referral-processor.git
cd async-referral-processor
npm install
```

### Start MongoDB & Redis

Make sure both MongoDB and Redis are running locally or via Docker.

### Start API server

```bash
npm run dev
```

### Start background worker

```bash
npm run worker
```

### View BullMQ dashboard

Visit: `http://localhost:3000/admin/queues`



## 🧪 Testing

* Use **Postman** or **cURL** to POST a `.pdf` to `/api/upload`
* Poll `/api/status/:jobId` to see progress
* Fetch result via `/api/result/:jobId`
* Check Bull Board to view job lifecycle and retries



## 👨‍⚕️ Built For

* Healthtech engineers building referral workflows
* Startup builders prototyping medical automation tools



## 📦 Sample Output

```json
{
  "patientName": "Maria Gomez",
  "dob": "02/14/1974",
  "symptoms": "Shortness of breath",
  "referralReason": "Shortness of breath, family history of lung disease",
  "rawPreview": "Referral for: Maria Gomez\nDOB: 02/14/1974..."
}
```

## 📷 Screenshots

Full walkthrough, screenshots, and feature breakdown available at:

🔗 [ParseMD Project Page](https://arvildey.com/projects/parsemd)

## 📜 License

This project is licensed under the [MIT License](LICENSE).
