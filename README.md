# 🏥 Doctor Appointment Booking System — API & Data Model Documentation

This backend service enables patients to book appointments with doctors through a time-slot-based system. Built using **NestJS**, it supports doctor and slot management, appointment creation, and cancellation — with robust validations to prevent double bookings.

🔗 **Live API Base URL**:
`https://doctor-booking-api.onrender.com/`

---

## 🧩 **Entities and Relationships**

### 🩺 Doctor

Represents a medical practitioner.

| Field            | Type   | Description                 |
| ---------------- | ------ | --------------------------- |
| `id`             | UUID   | Primary key                 |
| `name`           | string | Doctor's name               |
| `specialization` | string | e.g., Cardiology, Neurology |

**Relationships**:

* `hasMany` → **Slot** (available times)
* `hasMany` → **Appointment** (booked visits)

---

### ⏱ Slot

Represents a 30-minute or 1-hour time slot available for booking.

| Field           | Type     | Description                 |
| --------------- | -------- | --------------------------- |
| `id`            | UUID     | Primary key                 |
| `doctorId`      | UUID     | Linked doctor               |
| `startTime`     | datetime | Slot start time             |
| `endTime`       | datetime | Slot end time               |
| `isBooked`      | boolean  | True if already booked      |
| `appointmentId` | UUID     | Optional, FK to Appointment |

**Notes**:

* Each Slot is associated with exactly **one doctor**.
* It may be linked to **one appointment** (or none if available).

---

### 📋 Appointment

Represents a booking made by a patient for a particular slot with a doctor.

| Field         | Type    | Description                          |
| ------------- | ------- | ------------------------------------ |
| `id`          | UUID    | Primary key                          |
| `doctorId`    | UUID    | Doctor associated                    |
| `slotId`      | UUID    | Slot being booked                    |
| `patientName` | string  | Name of the patient                  |
| `isCancelled` | boolean | True if the appointment is cancelled |

**Cancellation Logic**:

* `isCancelled = true`
* Related `slot.isBooked = false`
* Related `slot.appointment = null`

---

## 🔗 **Entity Relationships Summary**

```txt
Doctor
  └─ has many Slots
  └─ has many Appointments

Slot
  └─ belongs to one Doctor
  └─ may have one Appointment

Appointment
  └─ links to one Slot and one Doctor
```

---

## 🔁 Slot Booking Flow

1. **Doctor sets availability** → e.g., 9:00 AM to 12:00 PM
2. **System generates slots** (in 30-min chunks)
3. **Frontend lists unbooked slots** (`isBooked = false`)
4. **Patient books a slot**:

   * Create an appointment
   * Set `slot.isBooked = true`
   * Link slot → appointment
5. **If appointment is cancelled**:

   * Set `appointment.isCancelled = true`
   * Reset `slot.isBooked = false`
   * Remove appointment from slot (`slot.appointment = null`)

---

## 🩺 Doctor Endpoints

### 1. `GET /doctors`

Fetch doctors with optional filters and pagination.

**Query Parameters**:

* `name=arun`
* `specialization=cardio`
* `page=1`
* `limit=10`

```http
GET /doctors?specialization=neuro&page=1&limit=5
```

✅ **Response**:

```json
{
  "data": [
    { "id": "...", "name": "Dr. Raj", "specialization": "Neurology" }
  ],
  "total": 1,
  "page": 1,
  "limit": 5,
  "totalPages": 1
}
```

---

### 2. `GET /doctors/:id`

Get basic info of a doctor by ID.

```http
GET /doctors/f5f6-...-uuid
```

---

### 3. `GET /doctors/:id/available-slots`

Returns all **unbooked slots** for the doctor.

```http
GET /doctors/f5f6-.../available-slots
```

✅ **Response**:

```json
[
  {
    "id": "...",
    "startTime": "2025-08-01T09:00:00.000Z",
    "endTime": "2025-08-01T09:30:00.000Z",
    "isBooked": false
  }
]
```

---

## 🕒 Slot Endpoints

### 4. `POST /slots/:doctorId`

Create a slot manually for a doctor.

📥 **Payload**:

```json
{
  "startTime": "2025-08-01T10:00:00.000Z",
  "endTime": "2025-08-01T10:30:00.000Z"
}
```

✅ **Response**:

```json
{
  "id": "slot-uuid",
  "startTime": "...",
  "endTime": "...",
  "isBooked": false
}
```

> 🛑 Rejects if it overlaps an existing slot (`400 Bad Request`)

---

### 5. `GET /slots/doctor/:id/all`

Get **all** slots for a doctor, whether booked or not.

---

### 6. `GET /slots/doctor/:id/available`

Return only **unbooked** slots (`isBooked = false`).

---

## 📆 Appointment Endpoints

### 7. `POST /appointments`

Create a new appointment by booking a slot.

📥 **Payload**:

```json
{
  "doctorId": "uuid-of-doctor",
  "slotId": "uuid-of-slot",
  "patientName": "Rajendra"
}
```

✅ **Response**:

```json
{
  "id": "appointment-uuid",
  "doctor": { ... },
  "slot": { ... },
  "patientName": "Rajendra",
  "isCancelled": false
}
```

---

### 8. `GET /appointments`

Get appointments (with optional patient name search and pagination).

**Query Parameters**:

* `patient=raj`
* `page=1`
* `limit=5`

✅ **Response**:

```json
{
  "data": [
    {
      "id": "...",
      "doctor": { ... },
      "slot": { "startTime": "...", "endTime": "..." },
      "patientName": "Rajendra",
      "isCancelled": false
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 5,
  "totalPages": 1
}
```

---

### 9. `DELETE /appointments/:id`

Cancel an appointment.

```http
DELETE /appointments/a6b7-...-uuid
```

✅ **Behavior**:

* Marks appointment as `isCancelled = true`
* Frees the slot (`isBooked = false`)
* Removes slot link (`slot.appointment = null`)

✅ **Response**:

```json
{
  "id": "...",
  "isCancelled": true
}
```

---

## 🌐 API Access

To use this backend in your frontend app or Postman, point your requests to:

```
https://doctor-booking-api.onrender.com/
```

**Example**:

```http
GET https://doctor-booking-api.onrender.com/doctors?specialization=cardio
```

---
