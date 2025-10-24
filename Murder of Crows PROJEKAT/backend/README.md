# Murder of Crows Tarot - FastAPI Backend

Modularan FastAPI backend za tarot aplikaciju sa ručnim unosom karata. Backend **ne izvlači karte nasumično** već radi isključivo sa ručnim unosom korisnika.

## Funkcionalnosti

- ✅ Ručni unos karata (bez nasumičnog izvlačenja)
- ✅ YAML baza značenja svih karata
- ✅ 7-kartni spread (Counting Crow) sa poetskim labelama
- ✅ 3-kartni spread sa custom formatom
- ✅ AI interpretacija putem lokalnog Ollama modela
- ✅ Prevod zasnovan na YAML bazi
- ✅ Arhiviranje sesija u JSON fajlove
- ✅ Pregled istorije prethodnih očitavanja

## Instalacija

```bash
# Pozicioniranje u backend folder
cd backend

# Instalacija zavisnosti
pip install -r requirements.txt

# Pokretanje servera
python main.py
```

Server će biti dostupan na `http://localhost:8000`

## Preduslovi

Za AI interpretaciju, mora biti pokrenut lokalni Ollama model:

```bash
# Instalacija Ollama (ako nije instalirana)
# https://ollama.ai

# Pokretanje Ollama modela
ollama run llama3
```

## API Endpointi

### 1. Root Endpoint
```http
GET /
```

**Response:**
```json
{
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
```

---

### 2. Counting Crow (7 Karata)
```http
POST /counting-crow
```

**Request Body:**
```json
{
  "cards": [
    "The Fool",
    "The Magician",
    "The High Priestess",
    "The Empress",
    "The Emperor",
    "The Hierophant",
    "The Lovers"
  ]
}
```

**Response:**
```json
{
  "reading": [
    {
      "label": "One for sorrow – The Fool",
      "text": "The Fool represents new beginnings...",
      "keywords": ["new beginnings", "innocence", "spontaneity"]
    },
    {
      "label": "Two for joy – The Magician",
      "text": "The Magician symbolizes manifestation...",
      "keywords": ["manifestation", "willpower", "skill"]
    }
    // ... 5 more cards with labels:
    // "Three for a girl", "Four for a boy", "Five for silver", 
    // "Six for gold", "Seven for a secret never to be told"
  ],
  "spread_type": "Counting Crow (7 Cards)"
}
```

---

### 3. Three Card Spread
```http
POST /three-card
```

**Request Body:**
```json
{
  "cards": ["The Fool", "The Magician", "The High Priestess"],
  "format": "Past – Present – Future"
}
```

**Response:**
```json
{
  "reading": [
    {
      "label": "Past – The Fool",
      "text": "The Fool represents new beginnings...",
      "keywords": ["new beginnings", "innocence", "spontaneity"]
    },
    {
      "label": "Present – The Magician",
      "text": "The Magician symbolizes manifestation...",
      "keywords": ["manifestation", "willpower", "skill"]
    },
    {
      "label": "Future – The High Priestess",
      "text": "The High Priestess embodies intuition...",
      "keywords": ["intuition", "mystery", "subconscious"]
    }
  ],
  "spread_type": "Three Card (Past – Present – Future)"
}
```

**Drugi primeri formata:**
- "Past – Present – Future"
- "Situation – Challenge – Solution"
- "Present situation – Choice 1 – Choice 2"

---

### 4. AI Interpretacija
```http
POST /ai-interpret
```

**Request Body:**
```json
{
  "text": "One for sorrow – The Fool\nText: The Fool represents new beginnings...\nKeywords: new beginnings, innocence, spontaneity"
}
```

**Response:**
```json
{
  "interpretation": "This reading suggests a journey into the unknown, embracing new opportunities with childlike wonder. The Fool's energy encourages you to take risks and trust the process..."
}
```

**Napomena:** Ollama mora biti pokrenut na `http://localhost:11434`

---

### 5. Prevod
```http
POST /translate
```

**Request Body:**
```json
{
  "text": "The Fool – new beginnings, innocence, spontaneity"
}
```

**Response:**
```json
{
  "translated": "[Translation based on YAML database]\nThe Fool – new beginnings, innocence, spontaneity"
}
```

**Napomena:** Prevod se radi isključivo na osnovu YAML baze, bez eksternih API poziva.

---

### 6. Arhiviranje Sesije
```http
POST /archive-session
```

**Request Body:**
```json
{
  "session": [
    {
      "spread_type": "Counting Crow",
      "cards": ["The Fool", "The Magician"],
      "timestamp": "2025-01-15T10:30:00"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Session archived successfully",
  "filename": "session_20250115_103000.json",
  "timestamp": "20250115_103000"
}
```

Sesije se čuvaju u `backend/sessions/` folderu.

---

### 7. Istorija Sesija
```http
GET /history
```

**Response:**
```json
{
  "sessions": [
    {
      "filename": "session_20250115_103000.json",
      "timestamp": "2025-01-15T10:30:00",
      "reading_count": 2
    },
    {
      "filename": "session_20250115_093000.json",
      "timestamp": "2025-01-15T09:30:00",
      "reading_count": 1
    }
  ]
}
```

---

## YAML Baza Podataka

`DataBase.yaml` sadrži sve Major Arcana karte sa poljima:
- **text**: Detaljno značenje karte
- **keywords**: Lista ključnih koncepata

Primer strukture:
```yaml
The Fool:
  text: "The Fool represents new beginnings..."
  keywords:
    - new beginnings
    - innocence
    - spontaneity
```

---

## Error Handling

API vraća HTTP status kodove:
- **200**: Success
- **400**: Bad Request (npr. pogrešan broj karata)
- **404**: Card Not Found (karta ne postoji u bazi)
- **500**: Internal Server Error
- **503**: Service Unavailable (Ollama nije dostupan)
- **504**: Gateway Timeout (AI interpretacija timeout)

---

## Testiranje

```bash
# Test Counting Crow endpoint
curl -X POST http://localhost:8000/counting-crow \
  -H "Content-Type: application/json" \
  -d '{"cards": ["The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", "The Hierophant", "The Lovers"]}'

# Test Three Card endpoint
curl -X POST http://localhost:8000/three-card \
  -H "Content-Type: application/json" \
  -d '{"cards": ["The Fool", "The Magician", "The High Priestess"], "format": "Past – Present – Future"}'

# Test History endpoint
curl http://localhost:8000/history
```

---

## Važne Napomene

1. **Backend NIKADA ne izvlači karte nasumično** - radi isključivo sa ručnim unosom
2. AI interpretacija zahteva lokalni Ollama model
3. Prevod se radi samo iz YAML baze (bez eksternih API-ja)
4. Sesije se arhiviraju lokalno u JSON fajlove
5. YAML baza mora postojati u `backend/DataBase.yaml`

---

## Struktura Projekta

```
backend/
├── main.py              # FastAPI aplikacija
├── DataBase.yaml        # Baza značenja karata
├── requirements.txt     # Python zavisnosti
├── README.md           # Dokumentacija
└── sessions/           # Folder za arhivirane sesije (kreira se automatski)
```

---

## API Dokumentacija

Automatska Swagger dokumentacija dostupna na:
- `http://localhost:8000/docs` (Swagger UI)
- `http://localhost:8000/redoc` (ReDoc)
