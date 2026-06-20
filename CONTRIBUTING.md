# Contributing to EcoDial

Thanks for your interest in improving the EcoDial Carbon Footprint Awareness Console. This document describes the local workflow and project standards.

## Project Layout

```text
backend/    FastAPI service — python calculation engine, schemas, database, Dockerfile
frontend/   Static web client — index.html, styles, client scripts, Nginx Dockerfile
docs/       Methodology documentation and math benchmarks
docker-compose.yml   Local multi-container orchestrator linking frontend (8080) and backend (8000)
```

## Development Setup

### Docker Orchestration (Recommended)

Ensure Docker and Docker Compose are installed, then run:

```bash
docker-compose up --build
```

This spins up:
- The FastAPI backend on `http://localhost:8000`
- The static Nginx client on `http://localhost:8080`

### Manual Local Dev Setup

If you prefer to run services manually without Docker:

#### 1. Backend (Python 3.10+)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend (Static Server)

Simply serve the `frontend/` directory using any HTTP server:

```bash
cd frontend
python3 -m http.server 8080
```

Then visit `http://localhost:8080` in your web browser.

## Code Quality Standards

1. **Deterministic Calculations**: The calculation formulas should strictly align with the local benchmark metrics defined in `docs/CARBON_CALCULATION_GUIDE.md`.
2. **Graceful Fallbacks**: Frontend JavaScript logic must catch network errors and fallback to local calculations so the application functions even when offline.
3. **Green Branding Aesthetics**: Keep the card designs uniform green. Refrain from using yellow or red highlight overlays on the passport card itself.
