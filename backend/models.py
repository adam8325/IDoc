from pydantic import BaseModel

class Req(BaseModel):
    text: str
    mode: str

class QueryContextReq(BaseModel):
    input: str
    contextInfo: bool
    filename: str = None
    mode: str 