from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

generator = pipeline(
    "text2text-generation",
    model="google/flan-t5-base"
)

class TextRequest(BaseModel):
    text: str


def generate(prompt, tokens=120):
    result = generator(
        prompt,
        max_new_tokens=tokens,
        do_sample=False,
        temperature=0.0
    )
    return result[0]["generated_text"].strip()


# ================= SUMMARIZE =================

@app.post("/summarize")
def summarize(req: TextRequest):
    if not req.text.strip():
        return {"result": ""}

    prompt = f"""
Summarize the following text in one short sentence.

Text:
{req.text}

Summary:
"""
    output = generate(prompt, 60)
    return {"result": output}


# ================= REWRITE =================

@app.post("/rewrite")
def rewrite(req: TextRequest):
    if not req.text.strip():
        return {"result": ""}

    prompt = f"""
Rewrite the following text in clear, professional English.
Keep the meaning the same.

Text:
{req.text}

Rewritten version:
"""
    output = generate(prompt, 150)
    return {"result": output}


# ================= GRAMMAR =================

@app.post("/grammar")
def grammar(req: TextRequest):
    if not req.text.strip():
        return {"result": ""}

    prompt = f"""
Correct the grammar mistakes in the following sentence.
Return ONLY the corrected sentence.

Sentence:
{req.text}

Corrected:
"""
    output = generate(prompt, 100)
    return {"result": output}