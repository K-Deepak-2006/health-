# Doctor Appointment System Architecture

## System Overview

The Doctor Appointment System will integrate with the existing AI-powered healthcare assistant web app, allowing users to find nearby doctors and book appointments based on their symptoms and preferences.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    AI Healthcare Assistant App                  │
│                                                                 │
├─────────────┬─────────────────────────┬───────────────────────┤
│             │                         │                       │
│  Symptom    │  Health Assistant      │  Doctor Appointment   │
│  Checker    │  Chatbot               │  System               │
│             │                         │                       │
└─────────────┴─────────────────────────┴───────────────────────┘
```

## Components

### 1. Frontend Components

- **DoctorSearch**: Search for doctors by location and specialty
- **DoctorList**: Display list of doctors with filtering options
- **DoctorProfile**: Show detailed information about a doctor
- **AppointmentBooking**: Calendar-based interface for booking appointments
- **AppointmentConfirmation**: Confirmation and details of booked appointments
- **UserAppointments**: List of user's upcoming and past appointments

### 2. Backend Services

- **DoctorSearchService**: Interface with Google Places API to find nearby doctors
- **DoctorProfileService**: Manage doctor profiles and specialties
- **AppointmentService**: Handle appointment booking, cancellation, and rescheduling
- **NotificationService**: Send appointment confirmations and reminders via email/SMS
- **SymptomAnalysisIntegration**: Connect with existing symptom analysis to recommend specialists

### 3. Data Models

#### Doctor
```typescript
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  distance?: number;  // Calculated based on user location
  availability: Availability[];
  placeId?: string;   // Google Places ID
}
```

#### Availability
```typescript
interface Availability {
  date: string;       // YYYY-MM-DD
  timeSlots: TimeSlot[];
}

interface TimeSlot {
  id: string;
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
  isAvailable: boolean;
}
```

#### Appointment
```typescript
interface Appointment {
  id: string;
  doctorId: string;
  userId: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
  status: 'scheduled' | 'completed' | 'cancelled';
  symptoms?: string;  // Optional symptoms description
  notes?: string;     // Optional notes
  createdAt: string;  // ISO date string
  updatedAt: string;  // ISO date string
}
```

#### User (Extended from existing user model)
```typescript
interface User {
  // Existing fields
  appointments?: Appointment[];
  preferredDoctors?: string[];  // Array of doctor IDs
}
```

## API Endpoints

### Doctor Search API

- `GET /api/doctors/search?location={lat,lng}&specialty={specialty}&radius={radius}`
  - Search for doctors based on location, specialty, and radius
  - Returns list of doctors with basic information

- `GET /api/doctors/{doctorId}`
  - Get detailed information about a specific doctor
  - Returns doctor profile with availability

### Appointment API

- `GET /api/doctors/{doctorId}/availability?date={date}`
  - Get available time slots for a specific doctor on a specific date
  - Returns list of available time slots

- `POST /api/appointments`
  - Book a new appointment
  - Request body: `{ doctorId, date, timeSlotId, symptoms, notes }`
  - Returns appointment details

- `GET /api/appointments/user`
  - Get all appointments for the current user
  - Returns list of appointments

- `PUT /api/appointments/{appointmentId}`
  - Update an existing appointment (reschedule or add notes)
  - Request body: `{ date, timeSlotId, notes }`
  - Returns updated appointment details

- `DELETE /api/appointments/{appointmentId}`
  - Cancel an appointment
  - Returns success status

### Notification API

- `POST /api/notifications/send`
  - Send appointment confirmation or reminder
  - Request body: `{ appointmentId, type: 'confirmation' | 'reminder' }`
  - Returns success status

## Integration with Existing Features

### Symptom Checker Integration

When the symptom checker identifies a condition that requires medical attention:
1. It will suggest booking an appointment with an appropriate specialist
2. User can click "Find Doctor" button to be directed to the Doctor Search component
3. The specialty will be pre-selected based on the symptom analysis

### Health Assistant Chatbot Integration

The chatbot will be enhanced to:
1. Answer questions about doctor appointments
2. Help users find doctors based on their symptoms
3. Guide users through the appointment booking process
4. Provide information about upcoming appointments

## External API Integrations

### Google Places API
- Used to find nearby doctors and medical facilities
- Provides location data, contact information, and ratings

### Twilio API
- Used to send SMS appointment confirmations and reminders
- Optional WhatsApp integration for notifications

### Email Service (SendGrid/Mailgun)
- Used to send email appointment confirmations and reminders
- Provides templates for different notification types

## Security Considerations

- All API endpoints will require authentication
- Sensitive medical information will be encrypted
- Compliance with healthcare data regulations (HIPAA, etc.)
- Secure storage of appointment and medical data

## Performance Considerations

- Caching of doctor search results to reduce API calls
- Pagination of doctor lists for better performance
- Optimized database queries for appointment management
- Background processing for notifications to avoid blocking 