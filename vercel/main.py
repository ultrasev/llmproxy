#!/usr/bin/env python3
from api.usage import USAGE as html
from api.hello import router as hello_router
from api.v1.openai import router as openai_router
from api.v1.groq import router as groq_router
from fastapi import FastAPI
from fastapi.responses import Response
app = FastAPI()


app.include_router(groq_router, prefix="/v1/groq")
app.include_router(openai_router, prefix="/v1/openai")
app.include_router(hello_router, prefix="/hello")


@app.get("/")
def _root():
    return Response(content=html, media_type="text/html")
