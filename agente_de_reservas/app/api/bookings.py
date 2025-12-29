from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.booking import Booking

router = APIRouter()
print("🔥 bookings.py CARGADO CORRECTAMENTE 🔥")

@router.delete("/{booking_id}")
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    # Buscar la cita por ID
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    
    db.delete(booking)
    db.commit()
    return {"message": "Cita eliminada correctamente"}