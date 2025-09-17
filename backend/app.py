# backend/app.py
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
import os
import re
from openai import OpenAI
from context import process_file

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))  
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_API_KEY"))

app = FastAPI()
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000", "https://idoc-etrl.onrender.com"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

#Helper functions and classes

class Req(BaseModel):
  text: str
  mode: str

class QueryContextReq(BaseModel):
    input: str
    contextInfo: bool

def looks_like_code(text):
    patterns = [
        r"\bdef\b", r"\bclass\b", r"\bimport\b", r"\bfunction\b", r"\bpublic\b", r"\bprivate\b", r"\bstatic\b",
        r"\bvoid\b", r"\bint\b", r"\bfloat\b", r"\bstring\b", r"\bvar\b", r"\blet\b", r"\bconst\b",
        r"\breturn\b", r"\bif\b", r"\belse\b", r"\bfor\b", r"\bwhile\b", r"\btry\b", r"\bcatch\b",
        r"\busing\b", r"\bnamespace\b", r"\bextends\b", r"\bimplements\b", r"\binterface\b",
        r"\{", r"\}", r";", r"\(", r"\)", r"\[", r"\]", r"//", r"#", r"/\\*", r"\\*/"
    ]
    # Tjek for mindst 2 kode-patterns for at undgå false positives
    matches = sum(bool(re.search(p, text)) for p in patterns)
    return matches >= 2


#API Endpoints

@app.post("/removeContext")
async def remove_context(req: dict):
    filename = req.get("filename")
    if not filename:
        return {"error": "No filename provided"}
    try:
        supabase.table("idoc").delete().eq("filename", filename).execute()
        return {"message": "File removed"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/summarize")
async def summarize(r: Req):
  if not r.text:
    raise HTTPException(status_code=400, detail="No text provided")

  if not looks_like_code(r.text):
        return {"output": "Indtast venligst noget kode."}

  if r.mode == "dev":
    prompt = f"""Du er en teknisk assistent. Lav teknisk dokumentation for koden nedenfor. Strukturér: kort beskrivelse, API/komponenter, setup, afhængigheder, eksempelkode.\n\nKode:\n{r.text}"""
  else:
    prompt = f"""Du er en brugervenlig assistent. Forklar kort hvad koden gør, hvordan man bruger den, og vigtigste funktioner - på et ikke-teknisk sprog.\n\nIndhold:\n{r.text}"""

  try:
    resp = client.chat.completions.create(
      model="gpt-4o",
      messages=[{"role": "user", "content": prompt}],
      max_tokens=800,
      temperature=0.1
    )
    output = resp.choices[0].message.content
    return {"output": output}
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


@app.post("/uploadContext")
async def upload_context(file: UploadFile = File(...)):
  content = await file.read()
  text = content.decode("utf-8")
  result = process_file(file.filename, text)
  return {"message": "File received", "length": len(text)}


@app.post("/queryContext")
async def query_context(req: QueryContextReq):
    try:
        # 1. Tjek input
        if not req.contextInfo:
            return {"error": "Ingen context fil uploadet"}
        if not req.input:
            return {"error": "Ingen input tekst"}
        if not looks_like_code(req.input):
            return {"output": "Indtast venligst noget kode."}

        print("[DEBUG] Modtaget input:", req.input[:100], "...")  # vis kun de første 100 tegn

        # 2. Lav embedding af brugerens input
        input_emb = client.embeddings.create(
            model="text-embedding-3-small",
            input=req.input
        ).data[0].embedding

        # 3. Supabase vector search via RPC
        try:
            res = supabase.rpc(
                "match_idoc_chunks",
                {
                    "query_embedding": input_emb,
                    "match_threshold": 0.1,
                    "match_count": 5
                }
            ).execute()
        except Exception as sup_err:
            print("[ERROR] Supabase RPC fejlede:", sup_err)
            return {"error": f"Supabase RPC fejlede: {sup_err}"}

        # 4. Fallback med summarize endpointet
        if not res.data:
            print("[DEBUG] Ingen context chunks fundet, fallback til summarize")
            prompt = f"Du har ikke uploadet nogen context-filer. Opsummer venligst koden:\n{req.input}"
            resp = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.1
            )
            return {"output": resp.choices[0].message.content}

        #TODO: Lige nu laver den ikke vector search, hvis der ikke er uploadet filer

        # 5. Saml relevante chunks
        top_chunks = [row["content"] for row in res.data]
        print(f"[DEBUG] Top {len(top_chunks)} chunks samlet:")
        for i, chunk in enumerate(top_chunks, 1):
            preview = chunk[:200].replace("\n", " ")  # vis kun de første 200 tegn uden nye linjer
            print(f"   [Chunk {i}] {preview}...")

        context_text = "\n".join(top_chunks)

        # 6. Generer dokumentation med context
        prompt = f"Brug følgende context fra knowledge base til at generere dokumentation:\n{context_text}\n\nKode:\n{req.input}. Inkluder ikke noget information fra context, der ikke er relevant for koden, og du skal ikke opsummere punkterne fra context. Hvis context er relevant, så tilret brugerens kode baseret på contexten. Som en start kan du nævne: 'Baseret på den givne context'"
        resp = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
            temperature=0.1
        )
        print("[DEBUG] Genereret dokumentation med context.")

        return {"output": resp.choices[0].message.content}

    except Exception as e:
        # Catch-all fejl
        print("[ERROR] Ukendt fejl i query_context:", str(e))
        return {"error": str(e)}
