from fastapi import APIRouter
from app.services.llm_agent import handle_chat
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()
print("🔥 agent.py CARGADO CORRECTAMENTE 🔥")

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Endpoint para recibir mensajes del frontend y responder usando LLM.
    """
    result = handle_chat(
        business_id=request.business_id,
        session_id=request.session_id,
        message=request.message
    )

    return {
        "reply": result["reply"],
        "status": result["status"]
    }
