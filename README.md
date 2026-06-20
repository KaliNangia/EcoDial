# 🌱 EcoDial — Interactive Carbon Footprint Console

**Live Web Application**: [https://ecodial-484628711205.us-central1.run.app](https://ecodial-484628711205.us-central1.run.app)

A vibe-coded solution for the problem statement: Design a solution that helps individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights.

---

## 🛠️ Setup & Running

### Run locally using Docker Compose:
```bash
docker-compose up --build
```
* **Frontend client**: Available at `http://localhost:8080`
* **Backend API server**: Available at `http://localhost:8000`

### Run locally using Shell:

#### 1. Backend:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### 2. Frontend:
```bash
cd frontend
python3 -m http.server 8080
```
Then visit `http://localhost:8080` in your web browser.
