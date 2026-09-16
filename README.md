# ApplyRemote - Distributed Job Queue & State Portal

A production-grade, full-stack **Distributed Job Queue Management Dashboard** built with **React (TypeScript + Vite)** and **NestJS (TypeORM + SQLite / PostgreSQL)**. Features a strict Finite State Machine, atomic database-level concurrency protection (**Optimistic Concurrency Control - OCC**), a live in-browser Race Condition Simulator, a Behance "ApplyRemote" UI with **Light/Dark mode**, and an interactive **Viva Preparation & Architecture Guide**.

---

## 🌐 Submission Links

- **GitHub Repository**: [https://github.com/Akshayahlawat21/airthporject](https://github.com/Akshayahlawat21/airthporject)
- **Live Frontend Dashboard**: `https://your-frontend-deployment.vercel.app` *(Deployable to Vercel / Netlify)*
- **Live Backend / API URL**: `https://your-backend-deployment.onrender.com` *(Deployable to Render / Railway / Fly.io)*
- **Interactive Swagger API Docs**: `https://your-backend-deployment.onrender.com/api/docs` *(or `http://localhost:4000/api/docs` locally)*

---

## 🌟 Key Features

1. **NestJS REST API**: Complete CRUD + State transition endpoints:
   - `POST /jobs` — Create a new job (`pending`, OCC v1).
   - `GET /jobs` — List all jobs (supports `?status=...` & `?search=...`).
   - `GET /jobs/stats` — Aggregate metric counters (`total`, `pending`, `running`, `completed`, `failed`).
   - `GET /jobs/:id` — Fetch a single job by UUID.
   - `PATCH /jobs/:id/status` — Atomically transition job status with OCC version fencing.
   - `DELETE /jobs/:id` — Permanently delete a job record from database.
   - `POST /jobs/:id/simulate` — Trigger background worker execution simulation.

2. **Strict State Machine**:
   - Valid transitions: `pending -> running -> completed | failed`.
   - Terminal states (`completed` and `failed`) are immutable and cannot transition further.

3. **Atomic Concurrency Protection (OCC)**:
   - Database-level conditional updates (`UPDATE jobs SET status = :target, version = version + 1 WHERE id = :id AND status = :expectedStatus AND version = :expectedVersion`).
   - Returns `409 Conflict` on race conditions, preventing double execution.

4. **Modern UI/UX (Behance "ApplyRemote" Style)**:
   - **Light & Dark Mode**: Instant switching via top bar **Moon / Sun** button with `localStorage` persistence.
   - **Hero Banner**: High-impact typography (`Find Remote Job in Worldwide_`), search pill bar, example filter tags, and minimalist vector remote worker illustration.
   - **Squircle Categories**: Interactive category cards (`Development`, `Design`, `Security`, `Research`, `Gaming`, `Data & ETL`, `Email Batch`).
   - **Featured Jobs Cards & Table View**: Seamless switcher between rich cards (with company icons, tech pills `[VUE] [REACT] [OCC-V1]`, status badges) and compact table layout.
   - **Custom Modals**: Non-blocking `PostJobModal`, `DeleteJobModal`, `FailJobModal`, `ConcurrencyModal`, and `VivaGuideModal`.

5. **Live Race Condition Simulator**:
   - In-app interactive lab firing 2 simultaneous requests via `Promise.all()` to visually demonstrate lock acquisition vs conflict rejection.

6. **Interactive Viva Guide (`📖 Viva Guide`)**:
   - Comprehensive in-app documentation detailing request lifecycles, component breakdown, API schemas, and model answers to key interview questions.

---

## 🧠 Section 3: Concurrency, State Machine & Edge Cases Analysis (Viva Answers)

### 1. Where should this rule be enforced?
> **Answer**: The state machine and concurrency constraints **MUST be enforced at the Backend Service & Database Layer**, never solely in the frontend.
> 
> While the React frontend provides optimistic UX and contextual action buttons (e.g., disabling invalid buttons), client-side logic can easily be bypassed, desynchronized, or manipulated. The NestJS backend service validates transitions against the state machine and executes an atomic conditional SQL update (`UPDATE jobs SET status = :target, version = version + 1 WHERE id = :id AND status = :expectedStatus AND version = :expectedVersion`).

### 2. What happens if someone bypasses the React application and calls the API directly?
> **Answer**: The backend remains completely secure and consistent:
> 1. **Data Validation**: NestJS `ValidationPipe` with `class-validator` enforces strict DTO types and allowed enum values (`JobStatus`).
> 2. **State Machine Validation**: `JobStateMachine.validateTransition(currentStatus, targetStatus)` throws a `400 Bad Request` if someone attempts an illegal transition (e.g., jumping from `pending` directly to `completed` or modifying a `completed`/`failed` terminal job).
> 3. **Concurrency & Integrity Checks**: The atomic conditional database update prevents race conditions even under direct high-concurrency API attacks.

### 3. What happens when two requests arrive at nearly the same time?
> **Answer**: Imagine Tab A and Tab B both see a job in `pending` status (version 1) and both submit `PATCH /jobs/:id/status` to change it to `running` at the exact same millisecond:
> 1. **Request 1 (Tab A)** arrives at the database:
>    - Executes `UPDATE jobs SET status = 'running', version = 2 WHERE id = :id AND status = 'pending' AND version = 1`.
>    - **Affected rows: 1**.
>    - Returns `HTTP 200 OK` with the updated job snapshot.
> 2. **Request 2 (Tab B)** arrives milliseconds later:
>    - Executes the identical conditional query: `WHERE status = 'pending' AND version = 1`.
>    - Because Request 1 already changed the row's status to `'running'` and version to `2`, **Affected rows: 0**.
>    - The service detects `affected === 0`, queries the latest state, and rejects the request with `HTTP 409 Conflict`:
>      > *"Concurrency Conflict: Job has already been transitioned to 'running' (version 2) by another concurrent request. Action aborted to preserve state consistency."*
> 
> **Result**: Zero duplicate executions, zero phantom transitions, and zero race conditions.

### 4. How would you prevent an invalid or inconsistent state?
> **Answer**:
> - **Atomic Conditional Updates**: Using `WHERE status = :currentStatus AND version = :currentVersion` ensures that updates are serialized by the database engine's row-level lock.
> - **Optimistic Concurrency Control (OCC)**: Every mutation increments a `@VersionColumn()`. Stale mutations fail immediately without requiring heavy distributed locks.
> - **Terminal State Immutability**: `JobStateMachine` strictly forbids transitions out of `completed` or `failed`.
> - **Global Exception Filter**: Transforms conflicts and validation errors into structured, client-digestible JSON responses.

---

## 🛠️ Tech Stack

- **Backend**: NestJS, TypeScript, TypeORM, SQLite (`better-sqlite3`) / PostgreSQL, Swagger / OpenAPI, Class-Validator, Jest.
- **Frontend**: React 18, TypeScript, Vite, Vanilla CSS Design System (Custom Tokens & Glassmorphism), Lucide Icons.

---

## 📦 Project Setup & Local Execution

### Prerequisites
- Node.js (v18+ or v20+ or v22+)
- npm (v9+)

### 1. Clone Repository & Install All Dependencies
```bash
# Clone the repository
git clone https://github.com/Akshayahlawat21/airthporject.git
cd airthporject

# Install both backend and frontend dependencies
npm run install:all
```

### 2. Run Backend Server
```bash
# Start backend (Port 4000)
npm run start:backend
# Or: cd backend && npm run start:dev
```
- API Base URL: `http://localhost:4000`
- Swagger Docs: `http://localhost:4000/api/docs`

### 3. Run Frontend Dev Server
```bash
# In a separate terminal, start frontend (Port 5173)
npm run start:frontend
# Or: cd frontend && npm run dev
```
- Frontend Dashboard: `http://localhost:5173`

### 4. Run Unit & E2E Tests
```bash
# Backend unit tests
npm run test:backend

# Backend e2e tests
npm run test:e2e
```

---

## 📡 API Specification

| Method | Endpoint | Description | Request Body | Response Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/jobs` | Create a new job | `{"title": string, "type": string, "autoSimulate"?: boolean}` | `201 Created`, `400 Bad Request` |
| `GET` | `/jobs` | List all jobs | None (Query: `?status=...&search=...`) | `200 OK` |
| `GET` | `/jobs/stats` | Status metrics | None | `200 OK` |
| `GET` | `/jobs/:id` | Get job by ID | None | `200 OK`, `404 Not Found` |
| `PATCH` | `/jobs/:id/status` | Update status (OCC) | `{"status": "running" \| "completed" \| "failed", "errorMessage"?: string}` | `200 OK`, `400 Bad Request`, `409 Conflict` |
| `DELETE` | `/jobs/:id` | Delete a job | None | `200 OK`, `404 Not Found` |
| `POST` | `/jobs/:id/simulate` | Trigger worker simulation | None | `202 Accepted` |

---

## 🚀 Deployment Instructions

### Frontend (Vercel)
1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variable:
   - `VITE_API_URL` = `https://<your-backend-url>`
5. Click **Deploy**.

### Backend (Render / Railway)
1. Go to [Render](https://render.com) and create a **Web Service**.
2. Connect your GitHub repository and set **Root Directory** to `backend`.
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm run start:prod`
5. Set Environment Variable:
   - `PORT` = `4000`
6. Click **Deploy**.
