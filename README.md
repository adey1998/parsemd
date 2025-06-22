# 🏥 ParseMD

A production-grade backend microservice for **asynchronously processing medical referral PDFs**. Designed to simulate real-world healthcare data workflows — where referrals arrive as scanned or digital documents, and systems must intelligently extract structured information in the background.

Built with **Node.js**, **MongoDB**, **Redis**, and **BullMQ**, this system is built for extensibility, resilience, and scale.

---

## ⚙️ System Overview

* **Upload PDF** via REST API
* **Job is queued** in Redis for async processing
* **Background worker** parses the PDF and extracts clinical metadata
* **MongoDB** stores job status (`queued`, `processing`, `complete`, `failed`) and results
* **BullMQ Dashboard** shows job lifecycle + retry status
* **Rate limiting middleware** protects from abuse
* **Client polls** the job status or retrieves structured result when complete

---

## 💡 System Design Highlights

### ✅ **Decoupled Processing (Queue-Based Architecture)**

* Upload endpoint is instantly responsive
* Parsing is offloaded to background worker
* Worker can be scaled horizontally without impacting API

### ♻️ **Durable Job State**

* Job status and results persisted in MongoDB
* Automatic retry logic via `BullMQ` (with exponential backoff)
* Manual dashboard for monitoring and debugging (Bull Board)

### 📦 **Modular Architecture**

* Extraction logic is pluggable (currently regex-based)
* Easily extend with:

  * ICD-10 mapping
  * Clinical NLP tools (e.g. spaCy, MedSpaCy, scispaCy)
  * OpenAI or Claude for unstructured note parsing

### 🧼 **Auto-Cleanup**

* Jobs TTL: expired jobs are auto-purged from MongoDB after 7 days

### 🔐 **Security & Abuse Protection**

* Basic **rate limiter** on upload endpoint to prevent abuse

---

## 🧱 Tech Stack

| Layer       | Technology                 |
| ----------- | -------------------------- |
| API Layer   | **Node.js**, **Express**   |
| Job Queue   | **Redis**, **BullMQ**      |
| Data Store  | **MongoDB**, **Mongoose**  |
| PDF Parsing | **pdf-parse**              |
| Dashboard   | **Bull Board** (BullMQ UI) |

---

## 🧠 Architectural Pattern: **Queue-Based Microservice**

We follow the **Asynchronous Processing with Worker Pattern**:

* **Stateless API server** handles user interaction and enqueues jobs
* **Stateful background workers** consume jobs from Redis
* Ensures **non-blocking** user experience, supports **horizontal scaling**, and allows for **fault isolation**

This decoupling makes it easy to add more processing logic (e.g. LLM pipelines) without modifying the core API layer.

---

## 📤 API Endpoints

### `POST /api/upload`

Upload a PDF. Response:

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

---

## 🚀 Getting Started

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

---

## 🧪 Testing

* Use **Postman** or **cURL** to POST a `.pdf` to `/api/upload`
* Poll `/api/status/:jobId` to see progress
* Fetch result via `/api/result/:jobId`
* Check Bull Board to view job lifecycle and retries

---

## 🔮 Roadmap Ideas

* [ ] FHIR-compliant output
* [ ] ICD-10 diagnosis/procedure tagging
* [ ] LLM-based fallback parser (OpenAI, Claude)
* [ ] File upload auth & storage (e.g. S3 or GCS)
* [ ] Clinic-specific dashboards

---

## 🤝 Built For

* Healthtech engineers building referral workflows
* Backend engineers interviewing for system design roles
* Startup builders prototyping medical automation tools

---

## 🧠 Sample Output

```json
{
  "patientName": "Maria Gomez",
  "dob": "02/14/1974",
  "symptoms": "Shortness of breath",
  "referralReason": "Shortness of breath, family history of lung disease",
  "rawPreview": "Referral for: Maria Gomez\nDOB: 02/14/1974..."
}
```


## Design Flow

            ┌───────────────────────────────────────────────┐
            │                  CLIENT (Postman, UI)         │
            │                                               │
            │   1. POST /api/upload (PDF file)              │
            └───────────────────────────────────────────────┘
                               │
                               ▼
            ┌───────────────────────────────────────────────┐
            │             EXPRESS API SERVER                │
            │         (src/server.js, src/api/upload.js)    │
            │                                               │
            │ - Saves uploaded file to /uploads             │
            │ - Creates Mongo job { status: "queued" }      │
            │ - Pushes job to in-memory queue               │
            └───────────────────────────────────────────────┘
                               │
                               ▼
         ┌───────────────────────────────────────────────┐
         │              In-Memory Job Queue              │
         │           (src/services/queue.js)             │
         └───────────────────────────────────────────────┘
                               │
         ┌────────────────────▼────────────────────┐
         │                                         │
         │         BACKGROUND WORKER               │
         │     (src/worker/index.js + processor.js)│
         │                                         │
         │ Polls queue every 2 seconds:            │
         │   - Reads PDF from /uploads             │
         │   - Extracts text with pdf-parse        │
         │   - Parses fields via regex             │
         │   - Updates Mongo:                      │
         │       status = "complete"               │
         │       result = { name, dob, ... }       │
         └─────────────────────────────────────────┘
                               │
                               ▼
             ┌──────────────────────────────────┐
             │         MONGODB (parsemd DB)     │
             │     (src/models/Job.js schema)   │
             └──────────────────────────────────┘
                               ▲
                               │
            ┌───────────────────────────────────────────────┐
            │                  CLIENT                       │
            │                                               │
            │ 2. GET /api/status/:jobId                     │
            │     → Reads job status + result from MongoDB  │
            └───────────────────────────────────────────────┘
---

## 🚀 Getting Started

```bash
git clone https://github.com/yourusername/async-referral-processor.git
cd async-referral-processor
npm install

# Start API server
npm run dev

# Start worker processor
npm run worker

