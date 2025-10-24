from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Optional
import yaml
import json
import requests
from datetime import datetime
from pathlib import Path

app = FastAPI(title="Murder of Crows Tarot", version="1.0.0")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YAML database
def load_database():
    with open("backend/DataBase.yaml", "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

DATABASE = load_database()

# Models with validation
class CountingCrowRequest(BaseModel):
    cards: List[str] = Field(max_items=7, min_items=7)
    
    @validator('cards', each_item=True)
    def validate_card_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Card name cannot be empty')
        if len(v) > 100:
            raise ValueError('Card name must be less than 100 characters')
        return v.strip()

class ThreeCardRequest(BaseModel):
    cards: List[str] = Field(max_items=3, min_items=3)
    format: str = Field(min_length=1, max_length=200)
    
    @validator('cards', each_item=True)
    def validate_card_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Card name cannot be empty')
        if len(v) > 100:
            raise ValueError('Card name must be less than 100 characters')
        return v.strip()
    
    @validator('format')
    def validate_format(cls, v):
        if not v or not v.strip():
            raise ValueError('Format cannot be empty')
        parts = [p.strip() for p in v.split('–')]
        if len(parts) != 3:
            raise ValueError('Format must contain exactly 3 labels separated by –')
        return v.strip()

class AIInterpretRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000)
    
    @validator('text')
    def validate_text(cls, v):
        if not v or not v.strip():
            raise ValueError('Text cannot be empty')
        return v.strip()

class TranslateRequest(BaseModel):
    text: str = Field(max_length=10000)

class ArchiveSessionRequest(BaseModel):
    session: List[dict] = Field(max_items=50)
    
    @validator('session')
    def validate_session(cls, v):
        if not v:
            raise ValueError('Session cannot be empty')
        # Validate session data structure
        for reading in v:
            if not isinstance(reading, dict):
                raise ValueError('Each session item must be a dictionary')
            # Validate reasonable size
            import json
            if len(json.dumps(reading)) > 50000:
                raise ValueError('Session reading data too large')
        return v

# Helper functions
def get_card_data(card_name: str):
    """Get card data from YAML database"""
    if card_name not in DATABASE:
        raise HTTPException(status_code=404, detail=f"Card '{card_name}' not found in database")
    return DATABASE[card_name]

def format_card_with_label(card_name: str, label: str):
    """Format card data with label"""
    card_data = get_card_data(card_name)
    return {
        "label": f"{label} – {card_name}",
        "text": card_data.get("text", ""),
        "keywords": card_data.get("keywords", [])
    }

# Endpoints
@app.get("/")
def root():
    return {
        "message": "Murder of Crows Tarot",
        "version": "1.0.0",
        "endpoints": [
            "/counting-crow",
            "/three-card",
            "/ai-interpret",
            "/translate",
            "/archive-session",
            "/history"
        ]
    }

@app.post("/counting-crow")
def counting_crow(request: CountingCrowRequest):
    """
    Endpoint for 7-card Counting Crow spread with manual input.
    Returns YAML text and keywords for each card with poetic labels.
    """
    
    feather_labels = [
        "One for sorrow",
        "Two for joy",
        "Three for a girl",
        "Four for a boy",
        "Five for silver",
        "Six for gold",
        "Seven for a secret never to be told"
    ]
    
    result = []
    for i, card_name in enumerate(request.cards):
        result.append(format_card_with_label(card_name, feather_labels[i]))
    
    return {"reading": result, "spread_type": "Counting Crow (7 Cards)"}

@app.post("/three-card")
def three_card(request: ThreeCardRequest):
    """
    Endpoint for 3-card spread with custom format labels.
    Returns YAML text and keywords for each card with format-based labels.
    """
    # Parse format string (e.g., "Past – Present – Future")
    format_labels = [label.strip() for label in request.format.split("–")]
    
    result = []
    for i, card_name in enumerate(request.cards):
        result.append(format_card_with_label(card_name, format_labels[i]))
    
    return {"reading": result, "spread_type": f"Three Card ({request.format})"}

@app.post("/ai-interpret")
def ai_interpret(request: AIInterpretRequest):
    """
    Endpoint for AI interpretation using local Ollama model.
    Sends combined text and keywords to AI for interpretation.
    """
    try:
        # Prepare prompt for Ollama
        prompt = f"Interpret this tarot reading based only on the provided text and keywords:\n\n{request.text}"
        
        # Call local Ollama API
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",  # or any other model you have installed
                "prompt": prompt,
                "stream": False
            },
            timeout=30
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="AI model request failed")
        
        ai_response = response.json()
        interpretation = ai_response.get("response", "No interpretation available")
        
        return {"interpretation": interpretation}
    
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Cannot connect to Ollama. Make sure it's running on http://localhost:11434")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="AI interpretation request timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI interpretation error: {str(e)}")

@app.post("/translate")
def translate(request: TranslateRequest):
    """
    Endpoint for translation based only on YAML database.
    No external API calls, only internal YAML lookup.
    """
    if not request.text:
        return {"translated": "No reading available to translate."}
    
    # This is a simplified translation that would need to be expanded
    # based on your specific translation requirements from YAML
    # For now, it returns the same text with a note
    translated_text = f"[Translation based on YAML database]\n{request.text}"
    
    return {"translated": translated_text}

@app.post("/archive-session")
def archive_session(request: ArchiveSessionRequest):
    """
    Endpoint for archiving reading sessions to JSON files.
    Saves session with timestamp in sessions/ folder.
    """
    # Create sessions directory if it doesn't exist
    sessions_dir = Path("backend/sessions")
    sessions_dir.mkdir(exist_ok=True)
    
    # Generate timestamp filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"session_{timestamp}.json"
    filepath = sessions_dir / filename
    
    # Sanitize and validate session data before saving
    sanitized_session = []
    for reading in request.session:
        # Only keep expected fields to prevent data injection
        sanitized_reading = {
            k: v for k, v in reading.items() 
            if k in ['reading', 'spread_type', 'timestamp']
        }
        sanitized_session.append(sanitized_reading)
    
    # Save session to file
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "readings": sanitized_session
        }, f, indent=2, ensure_ascii=False)
    
    return {
        "message": "Session archived successfully",
        "filename": filename,
        "timestamp": timestamp
    }

@app.get("/history")
def get_history():
    """
    Endpoint for retrieving list of previous sessions.
    Returns list of archived session files.
    """
    sessions_dir = Path("backend/sessions")
    
    if not sessions_dir.exists():
        return {"sessions": []}
    
    sessions = []
    for file in sorted(sessions_dir.glob("session_*.json"), reverse=True):
        with open(file, "r", encoding="utf-8") as f:
            data = json.load(f)
            sessions.append({
                "filename": file.name,
                "timestamp": data.get("timestamp"),
                "reading_count": len(data.get("readings", []))
            })
    
    return {"sessions": sessions}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
