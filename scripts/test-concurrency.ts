/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import axios from 'axios';

// const API = 'https://doctor-booking-api.onrender.com';


const API = 'http://localhost:3000'
interface BookingPayload {
  doctorId: string;
  slotId: string;
  patientName: string;
}

const payloads: BookingPayload[] = [
  {
    doctorId: "0cb2f4a7-e482-4681-9ac8-2dfeefcbbe36",
    slotId: "0062a0b6-55fe-43fb-92ce-a515b398e6a3",
    patientName: 'Patient One',
  },
  {
    doctorId: "0cb2f4a7-e482-4681-9ac8-2dfeefcbbe36",
    slotId: "0062a0b6-55fe-43fb-92ce-a515b398e6a3",
    patientName: 'Patient Two',
  },
];

function logAxiosError(error: unknown, label: string): void {
  if (axios.isAxiosError(error)) {
    console.error(`${label} failed:`, error.response?.data?.message ?? error.message);
  } else {
    console.error(`${label} failed with unknown error:`, error);
  }
}

async function simulateConcurrentBooking() {
  await Promise.all(
    payloads.map((payload) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      axios
        .post(`${API}/appointments`, payload)
        .then((res) => {
          console.log(`${payload.patientName} booked:`, res.data);
        })
        .catch((err: unknown) => {
          logAxiosError(err, payload.patientName);
        }),
    ),
  );
}

void simulateConcurrentBooking();


// npx ts-node scripts/test-concurrency.ts