# PathFinder AI - System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (Next.js 14+ App Router, TypeScript, Tailwind CSS)"]
        UI["Modern UI (shadcn/ui, Lucide, Recharts)"]
        State["Client State & Auth Store"]
        Lang["next-intl (EN / HI / TA)"]
    end

    subgraph API_Gateway ["FastAPI Gateway & Security Layer"]
        CORS["CORS & Security Headers Middleware"]
        RateLimiter["Rate Limiting Middleware"]
        AuthMiddleware["JWT / Firebase Auth Verification"]
    end

    subgraph Backend_Services ["FastAPI Backend Services Layer"]
        AuthSvc["Auth Service (OAuth + RBAC)"]
        AssessSvc["Adaptive Assessment Service"]
        RecomSvc["AI Career Recommendation Engine"]
        SkillGapSvc["Skill Gap & Radar Engine"]
        RoadmapSvc["Roadmap & Milestone Generator"]
        ResumeSvc["ATS Resume Analyser (PyPDF)"]
        ChatSvc["Context-Aware Chatbot Service"]
        MockIntSvc["Mock Interview Evaluator"]
        SchedSvc["APScheduler Background Jobs"]
    end

    subgraph AI_Layer ["AI & External Services"]
        Gemini["Google Gemini Pro / Flash (Structured JSON)"]
        YouTube["YouTube Learning API (Free Resources)"]
        GoogleCal["Google Calendar API (Deadlines/Milestones)"]
        EmailService["Resend / SMTP Email Dispatcher"]
        Storage["Storage Service (Local / Supabase)"]
    end

    subgraph Data_Layer ["Data Persistence"]
        DB[(PostgreSQL / SQLite via SQLAlchemy)]
        Cache[(In-Memory / Redis Result Cache)]
    end

    UI --> API_Gateway
    API_Gateway --> Backend_Services
    Backend_Services --> Gemini
    Backend_Services --> YouTube
    Backend_Services --> GoogleCal
    Backend_Services --> EmailService
    Backend_Services --> Storage
    Backend_Services --> DB
    Backend_Services --> Cache
```

## Architectural Highlights
- **Decoupled Architecture**: Clean contract between Next.js frontend and FastAPI backend via RESTful OpenAPI specifications.
- **Explainable AI Pipeline**: Every Gemini inference utilizes strictly validated Pydantic JSON schemas, defensive retry loops, prompt templates, and intelligent heuristics fallback when network or quota limits are reached.
- **Role-Based Access Control (RBAC)**: Distinct authorization scopes for students (`user`) and counselors/administrators (`admin`).
- **Resilient Offline-Ready Development**: Database layer transparently connects to PostgreSQL (Neon/Supabase) in production and falls back to SQLite in local/zero-config environments.

