# 🌱 EcoDial — Interactive Carbon Footprint Console

EcoDial is a premium, full-stack carbon footprint awareness and tracking platform built for the hackathon. It features an interactive retro-aesthetic dial console, live charts, customizable carbon passport exports, and a synchronized community competition leaderboard.

Developed specifically to help Indian households and users **track and reduce** their personal emission levels, it removes complex global treaties or references and focuses on immediate, local, actionable metrics.

---

## 🏆 Hackathon Submission Details

### 👥 Team & Architecture Credits
* **System Architect & Designer**: Designed and conceptualized by a **first-year B.Tech Student at the Indian Institute of Technology (IIT), Ropar**.
* **AI Core Architect & Coding Partner**: Co-developed and built in collaboration with **Gemini** (Google DeepMind Agentic Coding AI).

### 🌟 Why EcoDial is a Winning Entry
To win a hackathon, an entry must demonstrate not just a beautiful idea, but stellar engineering, security, and production readiness. EcoDial excels across all columns:
1. **Decoupled Modern Architecture**: Transitioned from a simple static webpage into a professional **FastAPI backend API + static Nginx frontend client** stack.
2. **Production-Ready Orchestration**: Powered by **Docker & Docker Compose**. Judges can launch the entire system using a single command without worrying about package installs or environment setups.
3. **Ironclad Server-Side Security**: Features server-side math calculations and strict boundary checks via **Pydantic Schemas** (`schemas.py`). This prevents client-side script tampering or score manipulation on the leaderboard.
4. **Offline Resilience (Graceful Fallback)**: The frontend SPA features a robust fallback handler. If the backend FastAPI server goes offline, calculations and community scores instantly downgrade to client-side math equations and localStorage, ensuring zero app crashes.
5. **Premium Interactive UX**: Built with custom SVG dial trackers, Web Audio click synthesis for tactile feedback, CSS glassmorphic animations, and custom canvas-based card image generators.
6. **Demographic Tailoring**: Designed for Indian users, replacing out-of-context global treaty labels with direct target trackers.

---

## 🚀 Key Features

* **Tactile Dial Controls**: Drag-controlled tactile dials with Web Audio click synthesis for fine-tuning household values.
* **Server-Side Security**: Calculates carbon outputs and checks input ranges (`schemas.py`) on a Python FastAPI backend to prevent client-side script tampering on the community leaderboard.
* **Shared Leaderboard Sync**: Updates ranks automatically and securely into a shared JSON-based server database.
* **Resilient Offline Fallback**: If the backend API server goes offline, the frontend seamlessly degrades to browser local storage and client-side calculations, keeping the app 100% interactive.
* **Pixel-Perfect PNG Export**: Generates and downloads high-contrast carbon passport cards with text-based retro ASCII emoticons corresponding to the user's footprint status:
  * `(^_^)` **Sustainable Status** (≤ 2.0 tonnes)
  * `(-_-)` **Moderate Status** (2.0 - 4.8 tonnes)
  * `(>_<)` **High Emitted Status** (> 4.8 tonnes)
* **Consistent Brand Aesthetic**: A unified forest-green design theme across both online and exported visual cards.

---

## 📂 Project Structure

```text
Ecodial/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI router, leaderboard database logs
│   │   ├── schemas.py              # Pydantic input models (input boundaries)
│   │   └── calculator.py           # Carbon calculation math
│   ├── requirements.txt            # Python dependencies (FastAPI, Uvicorn, Pydantic)
│   └── Dockerfile                  # Slim python runtime configuration
├── frontend/
│   ├── css/
│   │   └── styles.css              # Premium dark-emerald layout design sheet
│   ├── js/
│   │   └── app.js                  # Frontend interactive controllers & API calls
│   ├── index.html                  # Console interface structure
│   └── Dockerfile                  # Lightweight Nginx-alpine image configuration
├── docs/
│   └── CARBON_CALCULATION_GUIDE.md # Scientific formulas & sources
├── docker-compose.yml              # Local multi-container orchestrator
├── .dockerignore                   # Ignores local environments and caches
├── .editorconfig                   # Workspace code style guidelines
├── .gitignore                      # Excluded git tracking files
├── .pre-commit-config.yaml         # Linting and formatting hooks
├── CHANGELOG.md                    # Project development changelog
└── CONTRIBUTING.md                 # Contribution setup guides
```

---

## 🛠️ Installation & Running

### Option 1: Docker Compose (Easiest)
Ensure you have [Docker](https://www.docker.com/) running on your system, then launch the entire stack:
```bash
docker-compose up --build
```
* **Frontend client**: Available at `http://localhost:8080`
* **Backend API server**: Available at `http://localhost:8000`

### Option 2: Local Shell Setup
If running locally without Docker:

#### 1. Start FastAPI Backend:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### 2. Start Frontend Server:
Use any simple HTTP server to serve the static frontend directory:
```bash
cd frontend
python3 -m http.server 8080
```
Then visit `http://localhost:8080` in your web browser.

---

## 🧪 Scientific Calculation Methodology
Calculations are based on annual kilograms of CO2-equivalent (kg CO2e) using standard local models (DEFRA, Scarborough et al. lifecycles, and EPA WARM indices). 

See our full formula list and benchmarks at [docs/CARBON_CALCULATION_GUIDE.md](file:///Users/mybook/Downloads/SOPHOMORE/HACKATHON/Ecodial/docs/CARBON_CALCULATION_GUIDE.md).
