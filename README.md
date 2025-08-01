
---

## 🧩 **Entities and Relationships**

### 🩺 Doctor

* `id`: UUID (PK)
* `name`: string
* `specialization`: string
* **Relations:**

  * `hasMany` → **Slot**
  * `hasMany` → **Appointment**

---

### ⏱ Slot

* `id`: UUID (PK)
* `doctorId`: FK → Doctor
* `startTime`: timestamp
* `endTime`: timestamp
* `isBooked`: boolean
* `appointmentId`: FK → Appointment (nullable, 1–1)
* **Represents a 30-min or 1-hour appointment slot.**

---

### 📋 Appointment

* `id`: UUID (PK)
* `doctorId`: FK → Doctor
* `slotId`: FK → Slot (1–1)
* `patientName`: string
* `isCancelled`: boolean
* **Booking links a doctor, a slot, and patient name.**
* Cancelling an appointment:

  * `isCancelled = true`
  * `slot.isBooked = false`
  * `slot.appointment = null`

---

## 🔗 **Diagram (Relationships Summary)**



* A **Doctor** has many **Slots**, and **Appointments**.
* A **Slot** is tied to one **Doctor** and **may** have one **Appointment**.
* An **Appointment** links a **Slot**, **Doctor**, and **Patient Name**.

---

## ✅ Slot Booking Flow

1. **Doctor creates availability** → e.g., 9:00 AM to 12:00 PM
2. **System generates slots** → 9–9:30, 9:30–10:00, etc.
3. **Patient sees available slots** (where `isBooked = false`)
4. **Patient books a slot**:

   * Create appointment
   * Set `isBooked = true`
   * Assign appointment to that slot
5. **Patient cancels appointment**:

   * Mark appointment as `isCancelled = true`
   * Reset `slot.isBooked = false` and `slot.appointment = null`

---
## 🩺 Doctor Endpoints

### 1. `GET /doctors`

**Query Params (optional):**

* `specialization=cardio`
* `name=arun`
* `page=1`
* `limit=10`

✅ Sample:

```http
GET /doctors?specialization=neuro&page=1&limit=5
```

✅ Response:

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

```http
GET /doctors/f5f6-...-uuid
```

✅ Response:

```json
{ "id": "...", "name": "Dr. Arun", "specialization": "Cardiology" }
```

---

### 3. `GET /doctors/:id/available-slots`

```http
GET /doctors/f5f6-.../available-slots
```

✅ Response:

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

> Used to manually create a new slot for a doctor
> *(doctor ID comes from frontend or seeded data)*

#### Payload:

```json
{
  "startTime": "2025-08-01T10:00:00.000Z",
  "endTime": "2025-08-01T10:30:00.000Z"
}
```

✅ Response:

```json
{
  "id": "slot-uuid",
  "startTime": "...",
  "endTime": "...",
  "isBooked": false
}
```

> ❌ Will throw `400 Bad Request` if overlapping another slot.

---

### 5. `GET /slots/doctor/:id/all`

Return all slots for a doctor.

---

### 6. `GET /slots/doctor/:id/available`

Return only **unbooked** slots.

---

## 📆 Appointment Endpoints

### 7. `POST /appointments`

#### Payload:

```json
{
  "doctorId": "uuid-of-doctor",
  "slotId": "uuid-of-slot",
  "patientName": "Rajendra"
}
```

✅ Response:

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

**Query params (optional):**

* `patient=Rajendra`
* `page=1`
* `limit=5`

✅ Sample:

```http
GET /appointments?patient=raj&page=1&limit=5
```

✅ Response:

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

```http
DELETE /appointments/a6b7-...-uuid
```

✅ Behavior:

* Marks `appointment.isCancelled = true`
* Frees `slot.isBooked = false`
* Removes slot.appointment

✅ Response:

```json
{
  "id": "...",
  "isCancelled": true
}
```

---


