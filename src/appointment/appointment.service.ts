import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  async create(doctorId: string, slotId: string, patientName: string) {
    const [doctor, slot] = await Promise.all([
      this.doctorRepo.findOne({ where: { id: doctorId } }),
      this.slotRepo.findOne({
        where: { id: slotId },
        relations: ['appointment', 'doctor'],
      }),
    ]);

    if (!doctor) throw new NotFoundException('Doctor not found');
    if (!slot) throw new NotFoundException('Slot not found');

    if (slot.isBooked && (!slot.appointment || !slot.appointment.isCancelled)) {
      throw new BadRequestException('Slot already booked');
    }

    if (slot.appointment && slot.appointment.isCancelled) {
      const oldAppointment = slot.appointment;
      oldAppointment.slot = null;
      await this.appointmentRepo.save(oldAppointment);
    }

    const appointment = this.appointmentRepo.create({
      doctor,
      slot,
      patientName,
    });

    slot.isBooked = true;
    slot.appointment = appointment;

    await this.slotRepo.save(slot);
    return this.appointmentRepo.save(appointment);
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
