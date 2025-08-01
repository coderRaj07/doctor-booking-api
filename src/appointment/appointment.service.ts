import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Doctor } from '../doctor/entities/doctor.entity';
import { Slot } from '../slot/entities/slot.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
    @InjectRepository(Slot)
    private slotRepo: Repository<Slot>,
    private readonly dataSource: DataSource,
  ) {}

  async create(doctorId: string, slotId: string, patientName: string) {
    return this.dataSource.transaction(async (manager) => {
      // Step 1: Lock only Slot row — no relations
      const slot = await manager.findOne(Slot, {
        where: { id: slotId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!slot) throw new NotFoundException('Slot not found');

      // Step 2: Fetch Doctor and Appointment separately
      const [doctor, appointment] = await Promise.all([
        manager.findOne(Doctor, { where: { id: doctorId } }),
        slot.appointment
          ? manager.findOne(Appointment, { where: { id: slot.appointment.id } })
          : null,
      ]);

      if (!doctor) throw new NotFoundException('Doctor not found');

      // Manually attach doctor and appointment
      slot.doctor = doctor;
      slot.appointment = appointment;

      // Step 3: Check booking rules
      if (slot.isBooked && (!appointment || !appointment.isCancelled)) {
        throw new BadRequestException('Slot already booked');
      }

      // Step 4: Detach old cancelled appointment if exists
      if (appointment && appointment.isCancelled) {
        appointment.slot = null;
        await manager.save(Appointment, appointment);
      }

      // Step 5: Create and link appointment
      const newAppointment = manager.create(Appointment, {
        doctor,
        slot,
        patientName,
      });

      slot.isBooked = true;
      slot.appointment = newAppointment;

      await manager.save(Slot, slot);
      return manager.save(Appointment, newAppointment);
    });
  }

  async getAppointments(patientName?: string, page = 1, limit = 10) {
    const query = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.slot', 'slot');

    if (patientName) {
      query.andWhere('appointment.patientName ILIKE :name', {
        name: `%${patientName}%`,
      });
    }

    query.orderBy('slot.startTime', 'ASC');
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async cancelAppointment(appointmentId: string) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['slot'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.isCancelled) {
      return { message: 'Appointment was already cancelled.' };
    }

    const slot = appointment.slot;
    if (slot) {
      slot.isBooked = false;
      await this.slotRepo.save(slot);
    }

    appointment.isCancelled = true;
    return this.appointmentRepo.save(appointment);
  }
}
