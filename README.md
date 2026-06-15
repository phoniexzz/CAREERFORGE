# CareerForge AI

CareerForge is an authenticated Resume Studio with a TanStack React frontend
and a FastAPI/MySQL backend. CV uploads and parser review drafts are processed
in memory and are not stored by the browser or API. Only user-approved,
structured resume data is persisted.

## Start The Stack

1. Configure the backend:

   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

   Set a strong `JWT_SECRET`, update `DATABASE_URL`, configure the Gmail API,
   and add a rotated `GROQ_API_KEY`.

2. Start MySQL, the API, and the background worker:

   ```powershell
   docker compose up --build
   ```

3. Start the frontend:

   ```powershell
   npm.cmd install
   npm.cmd run dev -- --host 127.0.0.1 --port 4173
   ```

4. Open `http://127.0.0.1:4173`.

Verification, password-reset, and recovery links are delivered through the
Gmail API by the backend worker. Groq is the primary CV parser. The Docker stack
runs Ollama privately beside the API and pulls `qwen2.5:14b` into a persistent
model volume for fallback. Set `OLLAMA_PARSER_QUALIFIED=true` in production only
after that exact model passes the private 200-document benchmark. Production
also requires `GROQ_ZERO_DATA_RETENTION_CONFIRMED=true` after the account-level
setting is enabled.

The storage-free parser endpoint is `POST /api/v1/parser/cv`. It accepts the
PDF or DOCX as the raw request body with `Content-Type` and an encoded
`X-File-Name` header. This avoids multipart upload spooling to temporary disk.

## Deterministic Job Matching

The job matching backend does not use AI for scoring. Base CV/profile data and
Reed job descriptions are parsed and stored separately. The matching engine
uses controlled keyword normalisation, explicit hard-requirement checks, and
versioned rule-based scoring. The same profile, job, taxonomy, and scoring
rules always produce the same result.

Set `REED_API_KEY` in `backend/.env`. The existing backend worker imports the
configured Reed searches once per day at `REED_IMPORT_HOUR_UTC`, parses changed
jobs, and processes queued profile match runs in batches. Matchmaker requests
never send CV or job content to an AI provider.

The importer follows the official
[Reed Jobseeker API](https://www.reed.co.uk/developers/jobseeker): it pages
through search results, retrieves the full details record for each Reed job ID,
and stores both raw responses before deterministic parsing. For native
development, run the worker in a second backend terminal:

```powershell
cd backend
.\.venv\Scripts\python.exe -m app.worker
```

## Verification

Frontend:

```powershell
npm.cmd run lint
npm.cmd exec tsc -- --noEmit
npm.cmd run build
```

Backend:

```powershell
cd backend
.\.venv\Scripts\python.exe -m ruff check .
.\.venv\Scripts\python.exe -m mypy app
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\alembic.exe upgrade head
```

The parser benchmark runner and corpus format are documented in
`backend/benchmarks/cv_parser/README.md`. The release gate refuses fewer than
200 anonymised labelled cases.

See `backend/README.md` for Gmail authorization, native MySQL, worker, and
migration details.
