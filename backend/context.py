# context.py
import os
import hashlib
from dotenv import load_dotenv
load_dotenv()
from supabase import create_client
from langchain.text_splitter import RecursiveCharacterTextSplitter
from openai import OpenAI

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_API_KEY"))
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def insert_chunk(filename: str, content: str, embedding: list, filehash: str):
    """Indsætter en chunk i Supabase"""
    res = supabase.table("idoc").insert({
        "filename": filename,
        "content": content,
        "embedding": embedding,
        "filehash": filehash
    }).execute()
    return res


def chunk_text(text: str, chunk_size=500, chunk_overlap=50):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    return splitter.split_text(text)

def embed_chunks(chunks: list):
    embeddings = []
    for chunk in chunks:
        emb = client.embeddings.create(
            model="text-embedding-3-small",
            input=chunk
        ).data[0].embedding
        embeddings.append(emb)
    return embeddings

#TODO: Remove print debug statements in production

def get_file_hash(text: str) -> str:
    filehash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    print(f"[DEBUG] Beregnet filehash: {filehash}")
    return filehash

def file_exists(filename, filehash):
    res = supabase.table("idoc").select("id").eq("filename", filename).eq("filehash", filehash).execute()
    exists = len(res.data) > 0
    print(f"[DEBUG] Tjekker om fil findes: filename='{filename}', filehash='{filehash}' -> {exists}")
    return exists

def process_file(filename: str, text: str):
    """
    Hele pipeline:
    1. Chunk tekst
    2. Embed chunks
    3. Gem i Supabase
    """

    print(f"[INFO] Starter process_file for: {filename}")

    filehash = get_file_hash(text)

    if file_exists(filename, filehash):
        print(f"[INFO] Filen '{filename}' med denne hash findes allerede i databasen. Cache bruges.")
        return {"filename": filename, "cached": True}

    print(f"[INFO] Filen findes ikke i databasen. Starter chunking og embedding...")
    chunks = chunk_text(text)
    embeddings = embed_chunks(chunks)
    print(f"[DEBUG] Antal chunks: {len(chunks)}")

    for i, (chunk_text_, emb) in enumerate(zip(chunks, embeddings), start=1):
        print(f"[DEBUG] Indsætter chunk {i}/{len(chunks)} for fil '{filename}'")
        insert_chunk(filename, chunk_text_, emb, filehash)

    print(f"[INFO] Færdig med at behandle fil '{filename}'. Antal chunks gemt: {len(chunks)}")
    return {"filename": filename, "chunks": len(chunks)}
