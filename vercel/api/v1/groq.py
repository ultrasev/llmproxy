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


@router.post("/")
async def groq_api(args: ChatArgs):
    client = AsyncClient(base_url="https://api.groq.com/openai/v1",
                         api_key=args.api_key)
    return await client.chat.completions.create(
        model=args.model,
        messages=args.messages,
    )
