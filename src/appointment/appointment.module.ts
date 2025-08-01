import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { Doctor } from '../doctor/entities/doctor.entity';
import { Slot } from '../slot/entities/slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Doctor, Slot])],
  providers: [AppointmentService],
  controllers: [AppointmentController],
})
export class AppointmentModule {}
