import sys
import os
from pathlib import Path
from datetime import time
from dotenv import load_dotenv
from sqlalchemy import text
# Configurar la salida estándar a UTF-8 para evitar errores con emojis en Windows
sys.stdout.reconfigure(encoding='utf-8')

# Cargar variables de entorno usando ruta absoluta para evitar errores
env_path = Path(__file__).resolve().parent.parent / ".env.local"
load_dotenv(dotenv_path=env_path)

# Imprimir la URL de la base de datos para verificar la conexión al iniciar
db_url = os.getenv('DATABASE_URL', 'No definida (Usando SQLite local)')
# Ocultar contraseña en el log por seguridad
if "postgres" in db_url and "@" in db_url:
    print(f"🔌 DATABASE_URL: postgresql://*****@{db_url.split('@')[-1]}")
else:
    print(f"🔌 DATABASE_URL: {db_url}")

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.api.agent import router as agent_router
from app.api.bookings import router as bookings_router
from app.database import engine, Base, SessionLocal
# Importar modelos explícitamente para asegurar que SQLAlchemy los registre antes de crear las tablas
import app.models.booking
import app.models.schedule
from app.models.schedule import WeeklySchedule

print("🔥 main.py CARGADO CORRECTAMENTE 🔥")

# Crear las tablas en la base de datos automáticamente al iniciar
Base.metadata.create_all(bind=engine)
print("✅ Tablas de base de datos sincronizadas (Supabase)")

# Migración automática: Añadir columnas nuevas si faltan (create_all no actualiza tablas existentes)
def run_migrations():
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_date TEXT"))
            conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_details TEXT"))
            conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS google_event_id TEXT"))
            conn.commit()
            print("✅ Migración completada: Columnas event_date/event_details/google_event_id verificadas.")
    except Exception as e:
        print(f"⚠️ Nota migración: {e}")

run_migrations()

# Inicializar datos de horarios si la tabla está vacía
def init_schedule():
    db = SessionLocal()
    try:
        # Verificar si existen horarios para el negocio 'demo'
        # (El frontend suele usar 'demo' como ID por defecto)
        if not db.query(WeeklySchedule).filter_by(business_id="demo").first():
            print("🌱 Creando horarios por defecto (Lunes-Sábado 09:00-20:00)...")
            schedules = []
            for day in range(6): # 0=Lunes, 5=Sábado
                schedules.append(WeeklySchedule(
                    business_id="demo",
                    weekday=day,
                    open_time=time(9, 0),
                    close_time=time(20, 0)
                ))
            db.add_all(schedules)
            db.commit()
            print("✅ Horarios inicializados correctamente en Supabase.")
    finally:
        db.close()

init_schedule()

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
app.include_router(bookings_router, prefix="/bookings", tags=["bookings"])

# Endpoint raíz de prueba
@app.get("/")
async def root():
    return {"message": "API corriendo correctamente"}

'''# Opcional: endpoint para preflight OPTIONS
@app.options("/agent/chat")
async def preflight(request: Request):
    return Response(status_code=200)'''