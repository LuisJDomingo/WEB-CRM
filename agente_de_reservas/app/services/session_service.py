# backend/app/services/session_service.py

from typing import Dict

_SESSIONS: Dict[str, dict] = {}

def get_session(session_id: str) -> dict:
    """
    Devuelve el estado de la conversación.
    Crea una nueva sesión si no existe.
    """
    if session_id not in _SESSIONS:
        _SESSIONS[session_id] = {
            "intent": None,
            "date": None,
            "time": None,
            "confirmed": False
        }

    return _SESSIONS[session_id]


def clear_session(session_id: str):
    """
    Resetea la sesión tras confirmar una cita.
    """
    _SESSIONS.pop(session_id, None)
