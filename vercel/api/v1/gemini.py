#!/usr/bin/env python
import typing

import pydantic
from fastapi.routing import APIRouter
from openai import AsyncClient

router = APIRouter()


class ChatArgs(pydantic.BaseModel):
    api_key: str
    model: str
    messages: typing.List[typing.Dict[str, str]]

cache = {}
# expiringdict
@router.post("/")
async def groq_api(args: ChatArgs):
   ...