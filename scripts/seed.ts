import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Doctor } from '../src/doctor/entities/doctor.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Doctor],
  synchronize: true,
});

const seed = async () => {
  await AppDataSource.initialize();

  const doctorRepo = AppDataSource.getRepository(Doctor);

  const doctors = [
    { name: 'Dr. Ananya Sharma', specialization: 'Cardiology' },
    { name: 'Dr. Rohan Verma', specialization: 'Dermatology' },
    { name: 'Dr. Sneha Iyer', specialization: 'Neurology' },
    { name: 'Dr. Arjun Kapoor', specialization: 'Pediatrics' },
    { name: 'Dr. Meera Patel', specialization: 'Orthopedics' },
    { name: 'Dr. Kabir Khan', specialization: 'Oncology' },
    { name: 'Dr. Diya Mehta', specialization: 'ENT' },
    { name: 'Dr. Aarav Gupta', specialization: 'Psychiatry' },
    { name: 'Dr. Isha Reddy', specialization: 'Gastroenterology' },
    { name: 'Dr. Nikhil Joshi', specialization: 'Ophthalmology' },
    { name: 'Dr. Vihaan Rao', specialization: 'Gynecology' },
    { name: 'Dr. Saanvi Roy', specialization: 'Urology' },
    { name: 'Dr. Dev Bhat', specialization: 'General Medicine' },
    { name: 'Dr. Kavya Nair', specialization: 'Radiology' },
    { name: 'Dr. Aditya Sen', specialization: 'Endocrinology' },
  ];

  await doctorRepo.save(doctors);
  console.log('Seeded 15 doctors');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
