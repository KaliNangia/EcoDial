# 🌱 EcoDial — Interactive Carbon Footprint Console

EcoDial is a premium, full-stack carbon footprint awareness and tracking platform built for the hackathon. It features an interactive retro-aesthetic dial console, live charts, customizable carbon passport exports, and a synchronized community competition leaderboard.

Developed specifically to help Indian households and users **track and reduce** their personal emission levels, it removes complex global treaties or references and focuses on immediate, local, actionable metrics.

---

## 📝 Project Details & Credits

### 👥 Team & Credits
* **Project Concept & Ideation**: Conceptualized by a **first-year B.Tech Student at the Indian Institute of Technology (IIT), Ropar** (using this project to learn full-stack Python/FastAPI architectures).
* **Engineering & Code Implementation**: Built, coded, and implemented entirely by **Gemini** (Advanced Agentic AI platform from Google DeepMind), serving as the developer translating the project concept into software code.

### ⚙️ Technical Implementation
This project uses the following technical structure to run the application:
1. **Decoupled Architecture**: Separates the **FastAPI backend API** from the **static Nginx frontend client** stack.
2. **Containerized Orchestration**: Managed via **Docker & Docker Compose** to run both services together.
3. **Server-Side Calculations**: Uses **Pydantic Schemas** (`schemas.py`) on the backend to validate input values securely.
4. **Offline Fallback Handler**: Standardizes a fallback in the frontend JavaScript client so that if the backend API server is offline, the app falls back to client-side math equations and local storage storage.
5. **Interactive UI Elements**: Incorporates custom SVG dial trackers, Web Audio click synthesis for tactile feedback, CSS animations, and a canvas-based card exporter.
6. **Regional Alignment**: Configured specifically to track and compare emissions using localized benchmarks.

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
