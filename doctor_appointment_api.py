from fastapi import FastAPI, HTTPException, Depends, Query, Path, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, date, time, timedelta
import requests
import json
import os
import uuid
from geopy.distance import geodesic

# Initialize FastAPI app
app = FastAPI(
    title="Doctor Appointment API",
    description="API for finding doctors and booking appointments",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock database (replace with actual database in production)
# In a real application, you would use a proper database like PostgreSQL or MongoDB
class MockDatabase:
    def __init__(self):
        self.doctors = {}
        self.appointments = {}
        self.users = {}
        self.specialties = [
            "General Practitioner",
            "Cardiologist",
            "Dermatologist",
            "Neurologist",
            "Pediatrician",
            "Psychiatrist",
            "Orthopedist",
            "Gynecologist",
            "Urologist",
            "Ophthalmologist",
            "ENT Specialist",
            "Dentist"
        ]
        
        # Initialize with some mock data
        self._initialize_mock_data()
    
    def _initialize_mock_data(self):
        # Create some mock doctors
        for i in range(1, 11):
            doctor_id = str(uuid.uuid4())
            specialty = self.specialties[i % len(self.specialties)]
            
            # Create availability for the next 7 days
            availability = []
            for day in range(7):
                current_date = (datetime.now() + timedelta(days=day)).strftime("%Y-%m-%d")
                time_slots = []
                
                # Create time slots from 9 AM to 5 PM
                for hour in range(9, 17):
                    slot_id = str(uuid.uuid4())
                    start_time = f"{hour:02d}:00"
                    end_time = f"{hour+1:02d}:00"
                    time_slots.append({
                        "id": slot_id,
                        "startTime": start_time,
                        "endTime": end_time,
                        "isAvailable": True
                    })
                
                availability.append({
                    "date": current_date,
                    "timeSlots": time_slots
                })
            
            self.doctors[doctor_id] = {
                "id": doctor_id,
                "name": f"Dr. Smith {i}",
                "specialty": specialty,
                "address": f"{i} Medical Street, Healthcare City",
                "phone": f"+1-555-{i:03d}-{i*1111:04d}",
                "email": f"doctor{i}@example.com",
                "rating": 4.0 + (i % 10) / 10,
                "location": {
                    "lat": 37.7749 + (i * 0.01),
                    "lng": -122.4194 + (i * 0.01)
                },
                "availability": availability,
                "placeId": f"place_id_{i}"
            }

# Initialize mock database
db = MockDatabase()

# Pydantic models for request/response validation
class Location(BaseModel):
    lat: float
    lng: float

class TimeSlot(BaseModel):
    id: str
    startTime: str
    endTime: str
    isAvailable: bool

class Availability(BaseModel):
    date: str
    timeSlots: List[TimeSlot]

class Doctor(BaseModel):
    id: str
    name: str
    specialty: str
    address: str
    phone: str
    email: str
    rating: float
    distance: Optional[float] = None
    location: Location
    availability: Optional[List[Availability]] = None
    placeId: Optional[str] = None

class DoctorSearchResult(BaseModel):
    doctors: List[Doctor]
    total: int

class AppointmentCreate(BaseModel):
    doctorId: str
    date: str
    timeSlotId: str
    symptoms: Optional[str] = None
    notes: Optional[str] = None

class AppointmentUpdate(BaseModel):
    date: Optional[str] = None
    timeSlotId: Optional[str] = None
    notes: Optional[str] = None

class Appointment(BaseModel):
    id: str
    doctorId: str
    userId: str
    date: str
    startTime: str
    endTime: str
    status: str
    symptoms: Optional[str] = None
    notes: Optional[str] = None
    createdAt: str
    updatedAt: str
    doctor: Optional[Doctor] = None

class NotificationRequest(BaseModel):
    appointmentId: str
    type: str

class HealthCheckResponse(BaseModel):
    status: str
    version: str

# Helper functions
def calculate_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two coordinates in kilometers"""
    return geodesic((lat1, lng1), (lat2, lng2)).kilometers

def find_time_slot(doctor, date, time_slot_id):
    """Find a specific time slot for a doctor on a specific date"""
    for avail in doctor["availability"]:
        if avail["date"] == date:
            for slot in avail["timeSlots"]:
                if slot["id"] == time_slot_id:
                    return slot
    return None

def get_doctor_by_id(doctor_id: str):
    """Get a doctor by ID"""
    doctor = db.doctors.get(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

# API endpoints
@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/api/specialties", response_model=List[str])
async def get_specialties():
    """Get list of medical specialties"""
    return db.specialties

@app.get("/api/doctors/search", response_model=DoctorSearchResult)
async def search_doctors(
    location: str = Query(..., description="Latitude,longitude (e.g., 37.7749,-122.4194)"),
    specialty: Optional[str] = Query(None, description="Medical specialty"),
    radius: float = Query(10.0, description="Search radius in kilometers"),
    limit: int = Query(10, description="Maximum number of results"),
    offset: int = Query(0, description="Offset for pagination")
):
    """Search for doctors based on location, specialty, and radius"""
    try:
        # Parse location
        lat, lng = map(float, location.split(","))
        
        # Filter doctors by specialty and distance
        filtered_doctors = []
        for doctor_id, doctor in db.doctors.items():
            # Filter by specialty if provided
            if specialty and doctor["specialty"] != specialty:
                continue
            
            # Calculate distance
            doctor_lat = doctor["location"]["lat"]
            doctor_lng = doctor["location"]["lng"]
            distance = calculate_distance(lat, lng, doctor_lat, doctor_lng)
            
            # Filter by radius
            if distance <= radius:
                # Add distance to doctor info
                doctor_copy = doctor.copy()
                doctor_copy["distance"] = round(distance, 2)
                filtered_doctors.append(doctor_copy)
        
        # Sort by distance
        filtered_doctors.sort(key=lambda x: x["distance"])
        
        # Apply pagination
        paginated_doctors = filtered_doctors[offset:offset+limit]
        
        return {
            "doctors": paginated_doctors,
            "total": len(filtered_doctors)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid search parameters: {str(e)}")

@app.get("/api/doctors/{doctor_id}", response_model=Doctor)
async def get_doctor(
    doctor_id: str = Path(..., description="Doctor ID")
):
    """Get detailed information about a specific doctor"""
    doctor = get_doctor_by_id(doctor_id)
    return doctor

@app.get("/api/doctors/{doctor_id}/availability", response_model=List[Availability])
async def get_doctor_availability(
    doctor_id: str = Path(..., description="Doctor ID"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Get available time slots for a specific doctor"""
    doctor = get_doctor_by_id(doctor_id)
    
    # Filter availability by date range if provided
    if start_date and end_date:
        filtered_availability = [
            avail for avail in doctor["availability"]
            if start_date <= avail["date"] <= end_date
        ]
        return filtered_availability
    
    return doctor["availability"]

@app.post("/api/appointments", response_model=Appointment)
async def create_appointment(
    appointment: AppointmentCreate = Body(...)
):
    """Book a new appointment"""
    # Get doctor
    doctor = get_doctor_by_id(appointment.doctorId)
    
    # Find time slot
    time_slot = find_time_slot(doctor, appointment.date, appointment.timeSlotId)
    if not time_slot:
        raise HTTPException(status_code=404, detail="Time slot not found")
    
    # Check if time slot is available
    if not time_slot["isAvailable"]:
        raise HTTPException(status_code=400, detail="Time slot is not available")
    
    # Mark time slot as unavailable
    time_slot["isAvailable"] = False
    
    # Create appointment
    appointment_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    new_appointment = {
        "id": appointment_id,
        "doctorId": appointment.doctorId,
        "userId": "user_123",  # In a real app, get from authenticated user
        "date": appointment.date,
        "startTime": time_slot["startTime"],
        "endTime": time_slot["endTime"],
        "status": "scheduled",
        "symptoms": appointment.symptoms,
        "notes": appointment.notes,
        "createdAt": now,
        "updatedAt": now
    }
    
    # Store appointment
    db.appointments[appointment_id] = new_appointment
    
    # Add doctor information to response
    response = new_appointment.copy()
    response["doctor"] = doctor
    
    return response

@app.get("/api/appointments/user", response_model=List[Appointment])
async def get_user_appointments():
    """Get all appointments for the current user"""
    # In a real app, get user ID from authenticated user
    user_id = "user_123"
    
    # Filter appointments by user ID
    user_appointments = []
    for appointment_id, appointment in db.appointments.items():
        if appointment["userId"] == user_id:
            # Add doctor information
            appointment_copy = appointment.copy()
            appointment_copy["doctor"] = db.doctors.get(appointment["doctorId"])
            user_appointments.append(appointment_copy)
    
    return user_appointments

@app.put("/api/appointments/{appointment_id}", response_model=Appointment)
async def update_appointment(
    appointment_id: str = Path(..., description="Appointment ID"),
    appointment_update: AppointmentUpdate = Body(...)
):
    """Update an existing appointment"""
    # Check if appointment exists
    if appointment_id not in db.appointments:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment = db.appointments[appointment_id]
    
    # Update appointment
    if appointment_update.notes is not None:
        appointment["notes"] = appointment_update.notes
    
    # If rescheduling
    if appointment_update.date and appointment_update.timeSlotId:
        # Get doctor
        doctor = get_doctor_by_id(appointment["doctorId"])
        
        # Find new time slot
        new_time_slot = find_time_slot(doctor, appointment_update.date, appointment_update.timeSlotId)
        if not new_time_slot:
            raise HTTPException(status_code=404, detail="Time slot not found")
        
        # Check if new time slot is available
        if not new_time_slot["isAvailable"]:
            raise HTTPException(status_code=400, detail="Time slot is not available")
        
        # Find old time slot and mark it as available
        old_time_slot = find_time_slot(doctor, appointment["date"], appointment["timeSlotId"])
        if old_time_slot:
            old_time_slot["isAvailable"] = True
        
        # Mark new time slot as unavailable
        new_time_slot["isAvailable"] = False
        
        # Update appointment
        appointment["date"] = appointment_update.date
        appointment["startTime"] = new_time_slot["startTime"]
        appointment["endTime"] = new_time_slot["endTime"]
    
    # Update timestamp
    appointment["updatedAt"] = datetime.now().isoformat()
    
    # Add doctor information to response
    response = appointment.copy()
    response["doctor"] = db.doctors.get(appointment["doctorId"])
    
    return response

@app.delete("/api/appointments/{appointment_id}")
async def cancel_appointment(
    appointment_id: str = Path(..., description="Appointment ID")
):
    """Cancel an appointment"""
    # Check if appointment exists
    if appointment_id not in db.appointments:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment = db.appointments[appointment_id]
    
    # Get doctor
    doctor = get_doctor_by_id(appointment["doctorId"])
    
    # Find time slot and mark it as available
    time_slot = find_time_slot(doctor, appointment["date"], appointment["timeSlotId"])
    if time_slot:
        time_slot["isAvailable"] = True
    
    # Update appointment status
    appointment["status"] = "cancelled"
    appointment["updatedAt"] = datetime.now().isoformat()
    
    return {"message": "Appointment cancelled successfully"}

@app.post("/api/notifications/send")
async def send_notification(
    notification: NotificationRequest = Body(...)
):
    """Send appointment confirmation or reminder"""
    # Check if appointment exists
    if notification.appointmentId not in db.appointments:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment = db.appointments[notification.appointmentId]
    
    # In a real app, integrate with Twilio/SendGrid to send notifications
    # For now, just return a success message
    return {
        "message": f"{notification.type.capitalize()} sent successfully",
        "appointmentId": notification.appointmentId,
        "type": notification.type
    }

# Run the app with uvicorn if this file is executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("doctor_appointment_api:app", host="0.0.0.0", port=8002, reload=True) 