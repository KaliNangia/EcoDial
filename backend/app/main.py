# FastAPI Main App Server Logic

import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import FootprintInputs, LeaderboardMember
from .calculator import calculate_footprint

app = FastAPI(title="EcoDial Carbon API", version="1.0.0")

# Enable CORS to allow the frontend client to communicate with the server API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to actual frontend domain in production (e.g. localhost:8080)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database.json")

DEFAULT_MEMBERS = [
    {"id": "seed-1", "name": "Green Guru", "score": 1.65, "isSelf": False},
    {"id": "seed-2", "name": "Eco Champ", "score": 2.35, "isSelf": False},
    {"id": "seed-3", "name": "Carbon Heavy", "score": 5.40, "isSelf": False}
]

def load_db() -> list:
    """Loads community leaderboard members from the local database.json file."""
    if not os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "w") as f:
                json.dump(DEFAULT_MEMBERS, f, indent=4)
            return DEFAULT_MEMBERS
        except Exception:
            return DEFAULT_MEMBERS
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return DEFAULT_MEMBERS

def save_db(data: list):
    """Saves the database list to the local database.json file."""
    try:
        with open(DB_FILE, "w") as f:
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
