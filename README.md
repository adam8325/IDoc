# IDoc — AI-drevet kode-dokumentationsgenerator

Dette repository indeholder en simpel prototype af "IDoc": et værktøj der hjælper udviklere med at generere meningsfuld dokumentation ud fra kodeudsnit.
Start med at dokumentere din kode her: https://iduckdocks.vercel.app/

## Højniveau beskrivelse

IDoc er en lille webapp (Next.js frontend + FastAPI backend), hvor brugeren kan indsætte eller uploade kode, vælge dokumentationstype ("Teknisk / Dev" eller "Brugervenlig"), og få genereret dokumentation af AI. Der er også UX-funktioner som kopi-knap og download (genereret README.md).

## Teknologier

- Frontend: Next.js (React), Tailwind CSS
- Backend: FastAPI (Python), Uvicorn
- AI: OpenAI API (chat) via OpenAI Python SDK
- Øvrigt: lucide-react (ikoner), python-dotenv

## Features (implementeret)

- Paste eller upload af kode i frontend
- To dokumentations-tilstande: Teknisk (dev) og Brugervenlig
- Backend `POST /summarize` der bygger et mode-specifikt prompt og anmoder OpenAI
- Download af genereret dokumentation som `README.md`
- Kopiér-til-clipboard af output

## Knowledge Base & AI Features

IDoc understøtter nu upload af egne context-filer (KB) og bruger Retrieval-Augmented Generation (RAG) til at forbedre dokumentationen:

- **KB-upload:** Brugeren kan uploade egne guidelines, style guides eller kodeeksempler som context-fil.
- **Vector search:** Ved upload chunkes filen med LangChain, og hver chunk embeddes med OpenAI. Embeddings gemmes i Supabase (pgvector).
- **RAG:** Når der genereres dokumentation, laves embedding af brugerens input, og de mest relevante KB-chunks hentes via vector search og bruges som kontekst i prompten.
- **LangChain:** Bruges til effektiv chunking af context-filer, så vigtige guidelines kan matches præcist.
- **Filehash caching:** For at spare tokens og undgå gentagne embeddings, caches chunks og embeddings baseret på filens hash. Hvis filen allerede er uploadet, bruges eksisterende data.

Dette sikrer, at dokumentationen følger brugerens egne retningslinjer og standarder, og at AI-outputtet er både relevant og effektivt.

## Hvordan man kører projektet (lokalt)

1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate
pip install -r requirements.txt  # create this file if not present: fastapi uvicorn openai python-dotenv supabase
set -a  # or use your method to set env vars
# set OPENAI_API_KEY and optional SUPABASE_URL SUPABASE_KEY
uvicorn app:app --reload --port 8000
```

2. Frontend

```powershell
cd frontend
npm install
npm run dev
# open http://localhost:3000
```
