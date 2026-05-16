import asyncio
import logging
from fastapi import APIRouter, HTTPException
from api.schemas import NegotiationRequest, StepRequest
from engine.negotiation_loop import execute_negotiation, execute_single_step

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/negotiate")
async def start_negotiation(request: NegotiationRequest):
    """
    Full simulation endpoint.
    Runs the blocking negotiation loop in a thread pool to avoid
    blocking the FastAPI event loop.
    """
    try:
        # Convert Pydantic model to plain dict for the engine
        payload = request.model_dump()
        result = await asyncio.to_thread(
            execute_negotiation,
            payload,
            request.max_rounds
        )
        return result
    except Exception as e:
        logger.exception("Error in start_negotiation: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/negotiate/step")
async def negotiate_step(request: StepRequest):
    """
    Interactive turn generation for real-time chat.
    """
    try:
        context = request.context.model_dump()
        history = [entry.model_dump() for entry in request.history]
        role = request.role

        result = await asyncio.to_thread(
            execute_single_step,
            context,
            history,
            role
        )
        return result
    except Exception as e:
        logger.exception("Error in negotiate_step: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))
