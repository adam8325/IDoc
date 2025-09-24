# backend/app.py
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from models import Req, QueryContextReq
from openai import OpenAI
from context import process_file
import os
import re

#TODO:Add infocard to guide the user
#TODO:Consider adjusting logic between context upload and input upload in terms of the documentation type
#TODO:In addition maybe disable the Techincal Documentation option

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
                    "match_count": 5, 
                    "context_filename": req.filename
                }
            ).execute()
        except Exception as sup_err:
            print("[ERROR] Supabase RPC fejlede:", sup_err)
            return {"error": f"Supabase RPC fejlede: {sup_err}"}

        print(f"[DEBUG] context file name: {req.filename}")

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
        used_filenames = set(row["filename"] for row in res.data)
        print(f"[DEBUG] Context-filer brugt til dokumentation: {', '.join(used_filenames)}")
        print(f"[DEBUG] Top {len(top_chunks)} chunks samlet:")
        for i, chunk in enumerate(top_chunks, 1):
            preview = chunk[:200].replace("\n", " ")  # vis kun de første 200 tegn uden nye linjer
            print(f"   [Chunk {i}] {preview}...")

        context_text = "\n".join(top_chunks)

       # 6. Lav prompt baseret på mode
        if req.mode == "dev":
            prompt = (
                f"Baseret på den givne context, ret følgende kode til at følge standarderne.\n\n"
                f"Returnér kun den rettede kode i en kodeblok. Ingen forklaring eller kommentarer.\n\n"
                f"Context:\n{context_text}\n\nKode:\n{req.input}"
            )
        else:  # default til "user"
            prompt = (
                f"Baseret på den givne context, ret følgende kode til at følge standarderne.\n\n"
                f"Forklar ændringerne kort i punktopstilling først, og vis derefter den rettede kode i en kodeblok.\n"
                f"Skriv i et let forståeligt sprog.\n\n"
                f"Context:\n{context_text}\n\nKode:\n{req.input}"
            )

        # 7. Generer output
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
