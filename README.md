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

## Forslag og planlagte/kommende features
Dette afsnit forklarer hvordan IDoc kan udvikles videre til et produktivt værktøj ved hjælp af RAG, vector search, agents, og IDE/CI-integration.

1) Retrieval-Augmented Generation (RAG)
- Indeksér virksomhedens guidelines, README'er, CONTRIBUTING, interne style guides og relevante dokumenter i en vector store.
- Når bruger uploader kode, embed koden, hent top-k relevante guideline-chunks og giv disse som ekstra kontekst i prompten. Resultat: dokumentation der følger interne retningslinjer og team-konventioner.
- Implementering (prototype): Supabase + pgvector eller Pinecone/FAISS.

2) Agent-arkitektur
- Flere specialiserede agenter: classifier (bestem skabelontype), generator (lav dokumentation), reviewer/linter (tjek for manglende eksempler/fejl), formatter (MD/MDX/HTML).
- Agenter kan kalde værktøjer: læse repo-filer, eksekvere en finder for tests/eksempler, spørge CI eller issue-tracker.


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
