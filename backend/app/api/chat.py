"""
Chat API endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
import hashlib
import logging

from app.core.database import get_db
from app.core.redis import get_redis, CacheManager
from app.core.security import check_prompt_injection, sanitize_input
from app.services.retrieval import RetrievalService
from app.services.rerank import rerank_service
from app.services.llm import llm_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["chat"])


class Message(BaseModel):
    """Chat message"""
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    """Chat request body"""
    message: str = Field(..., min_length=1, max_length=2000)
    messages: Optional[List[Message]] = Field(default=None, max_length=20)
    stream: bool = True


class ChatResponse(BaseModel):
    """Chat response body (non-streaming)"""
    response: str
    sources: List[dict] = []


@router.post("/chat")
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Chat with AI assistant
    
    - Uses RAG to retrieve relevant information
    - Supports conversation history
    - Returns SSE stream by default
    """
    # Sanitize and validate input
    query = sanitize_input(request.message)
    
    # Check for prompt injection
    if check_prompt_injection(query):
        raise HTTPException(
            status_code=400,
            detail="Your message contains disallowed content. Please rephrase."
        )
    history = [msg.model_dump() for msg in request.messages] if request.messages else []
    
    # Calculate history hash for cache key
    history_hash = ""
    if history:
        history_str = str(history[-6:])  # Last 3 turns
        history_hash = hashlib.md5(history_str.encode()).hexdigest()[:8]
    
    # Check answer cache first
    redis_client = await get_redis()
    cache = CacheManager(redis_client)
    
    cached_answer = await cache.get_answer(query, history_hash)
    if cached_answer and not request.stream:
        logger.info(f"Answer cache hit for: {query[:50]}...")
        return ChatResponse(response=cached_answer, sources=[])
    
    # Retrieve relevant documents
    retrieval_service = RetrievalService(db)
    docs = await retrieval_service.search_with_empty_fallback(query, top_k=10)
    
    # Skip rerank if fallback or only one doc
    if len(docs) > 1 and docs[0].get("source_type") != "fallback":
        docs = await rerank_service.rerank(query, docs, top_n=3)
    else:
        docs = docs[:3]
    
    if request.stream:
        # Streaming response
        async def generate():
            full_response = []
            async for chunk in llm_service.generate_stream(query, docs, history):
                full_response.append(chunk)
                yield f"data: {chunk}\n\n"
            yield "data: [DONE]\n\n"
            
            # Cache the complete response
            complete = "".join(full_response)
            if complete and len(complete) > 10:
                await cache.set_answer(query, complete, history_hash)
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )
    else:
        # Non-streaming response
        response = await llm_service.generate(query, docs, history)
        
        # Cache response
        if response and len(response) > 10:
            await cache.set_answer(query, response, history_hash)
        
        return ChatResponse(
            response=response,
            sources=[{"content": d["content"][:100]} for d in docs[:2]]
        )


@router.get("/suggestions")
async def get_suggestions():
    """Get suggested questions"""
    redis_client = await get_redis()
    
    # Try cache first
    cached = await redis_client.get("suggestions")
    if cached:
        import json
        return {"suggestions": json.loads(cached)}
    
    # Default suggestions
    suggestions = [
        "你的主要技术栈是什么？",
        "介绍一下你做过的项目",
        "你有什么工作经验？",
        "如何联系你？",
    ]
    
    # Cache for 5 minutes
    import json
    await redis_client.setex("suggestions", 300, json.dumps(suggestions))
    
    return {"suggestions": suggestions}
