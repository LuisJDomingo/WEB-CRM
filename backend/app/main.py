from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.api.agent import router as agent_router

print("🔥 main.py CARGADO CORRECTAMENTE 🔥")
app = FastAPI(title="Chatbot API")

# 🔥 CORS para que el frontend pueda comunicarse con el backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        # "*"  # Permitir todos los orígenes (solo para desarrollo)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar el router con prefijo "/agent"
app.include_router(agent_router, prefix="/agent")

# Endpoint raíz de prueba
@app.get("/")
async def root():
    return {"message": "API corriendo correctamente"}

'''# Opcional: endpoint para preflight OPTIONS
@app.options("/agent/chat")
async def preflight(request: Request):
    return Response(status_code=200)'''