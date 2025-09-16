# context.py
import os
from dotenv import load_dotenv
load_dotenv()
from supabase import create_client
from langchain.text_splitter import RecursiveCharacterTextSplitter
from openai import OpenAI

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_API_KEY"))
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def insert_chunk(filename: str, content: str, embedding: list):
    """Indsætter en chunk i Supabase"""
    res = supabase.table("idoc").insert({
        "filename": filename,
        "content": content,
        "embedding": embedding
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

def process_file(filename: str, text: str):
    """
    Hele pipeline:
    1. Chunk tekst
    2. Embed chunks
    3. Gem i Supabase
    """
    chunks = chunk_text(text)
    embeddings = embed_chunks(chunks)

    for chunk_text_, emb in zip(chunks, embeddings):
        insert_chunk(filename, chunk_text_, emb)

    return {"filename": filename, "chunks": len(chunks)}