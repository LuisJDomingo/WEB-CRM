import os
import sys
import urllib.parse
from sqlalchemy.exc import OperationalError
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Obtiene la URL de la variable de entorno. Si no existe, usa SQLite por defecto.
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Si no hay DATABASE_URL configurada, verificamos si el usuario intentó usar las de frontend
    if os.getenv("VITE_SUPABASE_URL"):
        print("\n⚠️  ADVERTENCIA: Detectadas credenciales VITE_SUPABASE_URL pero falta DATABASE_URL.")
        print("   El backend Python necesita la 'Connection String' (postgresql://...) para funcionar con Supabase.")
        print("   Por defecto se usará SQLite local (sql_app.db) hasta que configures DATABASE_URL.\n")
    
    DATABASE_URL = "sqlite:///./sql_app.db"

# 🚨 VALIDACIÓN: Evitar error común de usar la URL HTTP de Supabase
if DATABASE_URL.startswith("http"):
    print("\n❌ ERROR CRÍTICO DE CONFIGURACIÓN:")
    print(f"   Has configurado DATABASE_URL con una URL web (https://...): {DATABASE_URL}")
    print("   Tu agente usa SQLAlchemy y necesita la 'Connection String' de PostgreSQL, no la API URL.")
    print("   El formato debe ser: postgresql://postgres.[proyecto]:[password]@[host]:6543/postgres")
    print("   Consíguela en: Supabase > Project Settings > Database > Connection string > URI\n")
    sys.exit(1)

# Ajuste necesario para PostgreSQL (Supabase)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 🛠️ AUTO-FIX: Codificar contraseña si contiene '@' (común en Supabase)
if "postgresql://" in DATABASE_URL and "@" in DATABASE_URL:
    try:
        scheme, rest = DATABASE_URL.split("://", 1)
        # Usamos rsplit para encontrar el ÚLTIMO @ (separador host)
        if "@" in rest:
            userinfo, host = rest.rsplit("@", 1)
            if ":" in userinfo:
                user, password = userinfo.split(":", 1)
                if "@" in password:
                    print("🔧 Detectado '@' en la contraseña. Codificando automáticamente...")
                    password = urllib.parse.quote_plus(password)
                    DATABASE_URL = f"{scheme}://{user}:{password}@{host}"
    except Exception as e:
        print(f"⚠️ Error intentando corregir URL: {e}")

# Configuración de argumentos: SQLite necesita check_same_thread, Postgres no.
connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        DATABASE_URL, 
        connect_args=connect_args
    )
    # 🔍 Probar conexión inmediatamente para detectar errores al inicio
    with engine.connect() as conn:
        pass
except ImportError:
    # Capturar error si falta el driver psycopg2
    if "postgres" in DATABASE_URL:
        print("\n❌ ERROR: Falta el driver de PostgreSQL (psycopg2).")
        print("   Por favor, ejecuta en tu terminal: pip install psycopg2-binary\n")
        sys.exit(1)
    raise
except OperationalError as e:
    print("\n❌ ERROR DE CONEXIÓN A LA BASE DE DATOS:")
    print(f"   Detalle: {e}")
    if "could not translate host name" in str(e):
        print("   💡 PISTA: Tu contraseña contiene caracteres especiales ('@') que han sido detectados.")
    sys.exit(1)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
