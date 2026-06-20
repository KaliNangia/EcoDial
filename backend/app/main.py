# FastAPI Main App Server Logic

import os
import json
import time
import threading
from collections import defaultdict
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from .schemas import FootprintInputs, LeaderboardMember
from .calculator import calculate_footprint

app = FastAPI(title="EcoDial Carbon API", version="1.0.0")

# 1. CORS Configuration (Restrict allowed origins for security)
origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://ecodial-484628711205.us-central1.run.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 2. Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' data: https://fonts.gstatic.com; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "img-src 'self' data:; "
            "connect-src 'self' *;"
        )
        return response

app.add_middleware(SecurityHeadersMiddleware)

# 3. Rate Limiting Middleware (DoS Protection)
class RateLimitingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, rate_limit: int = 100, window_secs: int = 60):
        super().__init__(app)
        self.rate_limit = rate_limit
        self.window_secs = window_secs
        self.request_records = defaultdict(list)
        self.lock = threading.Lock()

    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/api"):
            client_ip = request.client.host if request.client else "unknown"
            current_time = time.time()
            with self.lock:
                # Clean up timestamps older than window_secs
                self.request_records[client_ip] = [
                    t for t in self.request_records[client_ip]
                    if current_time - t < self.window_secs
                ]
                # Check rate limit
                if len(self.request_records[client_ip]) >= self.rate_limit:
                    return JSONResponse(
                        status_code=429,
                        content={"detail": "Too many requests. Please try again later."}
                    )
                self.request_records[client_ip].append(current_time)
        return await call_next(request)

app.add_middleware(RateLimitingMiddleware)

# 4. Cache Control Middleware (Optimize asset delivery and secure API data)
class CacheControlMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        path = request.url.path
        if not path.startswith("/api"):
            # Set Cache-Control header for static assets (cache for 1 hour)
            response.headers["Cache-Control"] = "public, max-age=3600"
        else:
            # Prevent caching of API requests
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        return response

app.add_middleware(CacheControlMiddleware)

# 5. Database Thread-Safe Lock and Cache
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database.json")

DEFAULT_MEMBERS = [
    {"id": "seed-1", "name": "Green Guru", "score": 1.65, "isSelf": False},
    {"id": "seed-2", "name": "Eco Champ", "score": 2.35, "isSelf": False},
    {"id": "seed-3", "name": "Carbon Heavy", "score": 5.40, "isSelf": False}
]

db_lock = threading.Lock()
_leaderboard_cache = None

def load_db() -> list:
    """Loads community leaderboard members with in-memory caching and thread-safety."""
    global _leaderboard_cache
    with db_lock:
        if _leaderboard_cache is not None:
            return _leaderboard_cache
        
        # Override file path if specified in environment (for testing)
        db_path = os.environ.get("DB_FILE", DB_FILE)
        
        if not os.path.exists(db_path):
            try:
                with open(db_path, "w") as f:
                    json.dump(DEFAULT_MEMBERS, f, indent=4)
                _leaderboard_cache = list(DEFAULT_MEMBERS)
                return _leaderboard_cache
            except Exception:
                return list(DEFAULT_MEMBERS)
        try:
            with open(db_path, "r") as f:
                _leaderboard_cache = json.load(f)
                return _leaderboard_cache
        except Exception:
            return list(DEFAULT_MEMBERS)

def save_db(data: list):
    """Saves the database list with in-memory caching and thread-safety."""
    global _leaderboard_cache
    with db_lock:
        _leaderboard_cache = list(data)
        db_path = os.environ.get("DB_FILE", DB_FILE)
        try:
            with open(db_path, "w") as f:
                json.dump(data, f, indent=4)
        except Exception as e:
            print(f"Failed to write database: {e}")

@app.post("/api/calculate")
def calculate_emissions(inputs: FootprintInputs):
    """
    Computes emissions securely on the server side using the mathematical model.
    """
    inputs_dict = inputs.model_dump()
    return calculate_footprint(inputs_dict)

@app.get("/api/leaderboard")
def get_leaderboard():
    """
    Fetches the shared leaderboard ranking list.
    """
    return load_db()

@app.post("/api/leaderboard")
def add_or_update_member(member: LeaderboardMember):
    """
    Inserts a new member or updates an existing member (e.g., updating user score).
    """
    db = load_db()
    
    # Check if member ID already exists or if it's the user trying to update their own record
    existing_idx = -1
    for i, m in enumerate(db):
        if m["id"] == member.id or (member.isSelf and m.get("isSelf")):
            existing_idx = i
            break
            
    # DoS Protection: restrict database member count to 50
    if existing_idx == -1 and len(db) >= 50:
        raise HTTPException(status_code=400, detail="Leaderboard has reached maximum capacity.")
        
    member_dict = member.model_dump()
    
    if existing_idx != -1:
        # Keep ID if updating by isSelf
        if member.isSelf:
            member_dict["id"] = db[existing_idx]["id"]
        db[existing_idx] = member_dict
    else:
        db.append(member_dict)
        
    save_db(db)
    return db

@app.delete("/api/leaderboard/{member_id}")
def delete_member(member_id: str):
    """
    Deletes a member from the leaderboard list (host user 'self' is protected).
    """
    db = load_db()
    new_db = []
    found = False
    
    for m in db:
        if m["id"] == member_id:
            found = True
            if m.get("isSelf"):
                raise HTTPException(status_code=400, detail="Cannot delete the host user.")
            continue
        new_db.append(m)
        
    if not found:
        raise HTTPException(status_code=404, detail="Leaderboard member not found.")
        
    save_db(new_db)
    return new_db

# Serve static files from the sibling 'static' directory if it exists
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
