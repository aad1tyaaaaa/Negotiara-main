from fastapi import APIRouter, HTTPException
from engine.negotiation_loop import execute_negotiation, execute_single_step

router = APIRouter()

@router.post("/negotiate")
async def start_negotiation(request: dict):
    """
    Standard simulation endpoint.
    """
    try:
        result = execute_negotiation(request, max_rounds=request.get("max_rounds", 5))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/negotiate/step")
async def negotiate_step(request: dict):
    """
    Interactive turn generation for real-time chat.
    Expects context, history, and role.
    """
    try:
        context = request.get("context")
        history = request.get("history", [])
        role = request.get("role", "SHIPPER")
        
        if not context:
            raise HTTPException(status_code=400, detail="Missing context in request body")
            
        result = execute_single_step(context, history, role=role)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
