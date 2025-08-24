import sqlite3
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ---------- CORS Middleware ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Database Setup ----------
def init_db():
    conn = sqlite3.connect("eco.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            name TEXT PRIMARY KEY,
            score INTEGER DEFAULT 0,
            trees INTEGER DEFAULT 0
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tree_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT,
            tree TEXT,
            FOREIGN KEY(user) REFERENCES users(name)
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ---------- Pydantic Models ----------
class Habit(BaseModel):
    user: str
    activity: str

class Plant(BaseModel):
    user: str
    tree: str

# ---------- Special Tree Mapping ----------
special_tree_map = {
    "Fed stray animals": "Lily",
    "Participated in area cleanup": "Tulip",
    "Watered community plants": "Banana",
    "Recycled Electronics": "Apple",
    "Green Donation": "Lotus",
    "Beach Cleanup": "Coconut",
    "Cleaning water campaign": "Tangerine",
}

# ---------- Endpoints ----------

@app.post("/log")
def log_habit(data: Habit):
    # Define points for activities
    habits = {
        "Used reusable bottle": 10,
        "Walked instead of car": 20,
        "Recycled domestic waste": 15,
        "Planted a seed in locality": 30,
        "Turned Off AC": 5,
        "Turned off lights": 5,
        "Public Transport / Cycle": 10,
        # Special activities
        "Fed stray animals": 50,
        "Participated in area cleanup": 75,
        "Beach Cleanup": 80,
        "Recycled Electronics": 50,
        "Cleaning water campaign": 75,
        "Watered community plants": 60,
        "Green Donation": 100,
    }

    points = habits.get(data.activity)
    if points is None:
        raise HTTPException(status_code=400, detail="Unknown habit")

    conn = sqlite3.connect("eco.db")
    cursor = conn.cursor()

    # Insert or update user score
    cursor.execute("SELECT score FROM users WHERE name = ?", (data.user,))
    row = cursor.fetchone()
    if row:
        cursor.execute("UPDATE users SET score = score + ? WHERE name = ?", (points, data.user))
    else:
        cursor.execute("INSERT INTO users (name, score, trees) VALUES (?, ?, 0)", (data.user, points))

    # If special activity, plant special tree automatically
    if data.activity in special_tree_map:
        tree_name = special_tree_map[data.activity]
        cursor.execute("UPDATE users SET trees = trees + 1 WHERE name = ?", (data.user,))
        cursor.execute("INSERT INTO tree_log (user, tree) VALUES (?, ?)", (data.user, tree_name))

    # Fetch updated values
    cursor.execute("SELECT score, trees FROM users WHERE name = ?", (data.user,))
    score, trees = cursor.fetchone()

    cursor.execute("SELECT tree, COUNT(*) FROM tree_log WHERE user = ? GROUP BY tree", (data.user,))
    breakdown = [{"name": t, "count": c} for t, c in cursor.fetchall()]

    conn.commit()
    conn.close()

    return {
        "message": "Habit logged",
        "points_added": points,
        "score": score,
        "trees": trees,
        "tree_breakdown": breakdown
    }

@app.get("/score/{user}")
def get_score(user: str):
    conn = sqlite3.connect("eco.db")
    cursor = conn.cursor()

    cursor.execute("SELECT score, trees FROM users WHERE name = ?", (user,))
    row = cursor.fetchone()
    if not row:
        return {"score": 0, "trees": 0, "tree_breakdown": []}

    score, trees = row

    cursor.execute("SELECT tree, COUNT(*) FROM tree_log WHERE user = ? GROUP BY tree", (user,))
    breakdown = [{"name": t, "count": c} for t, c in cursor.fetchall()]

    conn.close()
    return {"score": score, "trees": trees, "tree_breakdown": breakdown}

@app.post("/plant")
def plant_tree(data: Plant):
    conn = sqlite3.connect("eco.db")
    cursor = conn.cursor()

    cursor.execute("SELECT score FROM users WHERE name = ?", (data.user,))
    row = cursor.fetchone()
    if not row or row[0] < 100:
        raise HTTPException(status_code=400, detail="Not enough points")

    # Deduct 100 points and plant tree
    cursor.execute("UPDATE users SET score = score - 100, trees = trees + 1 WHERE name = ?", (data.user,))
    cursor.execute("INSERT INTO tree_log (user, tree) VALUES (?, ?)", (data.user, data.tree))

    conn.commit()
    conn.close()
    return {"message": f"Planted {data.tree}!", "tree": data.tree}
