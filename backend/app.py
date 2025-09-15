# backend/app.py
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))  

app = FastAPI()
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000", "https://idoc-etrl.onrender.com"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

class Req(BaseModel):
  text: str
  mode: str

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
  # Her kan du nu chunk'e, embedde og gemme i Supabase
  return {"message": "File received", "length": len(text)}
