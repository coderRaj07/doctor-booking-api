import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot } from './entities/slot.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { CreateSlotDto } from './dto/create-slot.dto';

@Injectable()
export class SlotService {
  constructor(
    @InjectRepository(Slot) private slotRepo: Repository<Slot>,
    @InjectRepository(Doctor) private doctorRepo: Repository<Doctor>,
  ) {}

  async createSlot(doctorId: string, dto: CreateSlotDto) {
    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    const interval = 30 * 60 * 1000; // 30 minutes in milliseconds

    if (start >= end) {
      throw new BadRequestException('Start time must be before end time');
    }

    const slotsToCreate: Slot[] = [];
    let current = new Date(start);

    while (current.getTime() + interval <= end.getTime()) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + interval);

      // Check for overlapping slot
      const existing = await this.slotRepo.findOne({
        where: {
          doctor: { id: doctorId },
          startTime: slotStart,
          endTime: slotEnd,
        },
      });

      if (!existing) {
        const newSlot = this.slotRepo.create({
          doctor,
          startTime: slotStart,
          endTime: slotEnd,
          isBooked: false,
        });
        slotsToCreate.push(newSlot);
      }

      current = slotEnd; // Move to next slot
    }

    if (slotsToCreate.length === 0) {
      throw new BadRequestException(
        'All 30-minute slots in this range already exist.',
      );
    }

    return this.slotRepo.save(slotsToCreate);
  }

  async getAvailableSlotsForDoctor(doctorId: string) {
    return this.slotRepo.find({
      where: {
        doctor: { id: doctorId },
        isBooked: false,
      },
      order: { startTime: 'ASC' },
    });
  }

  async getAllSlotsForDoctor(doctorId: string) {
    return this.slotRepo.find({
      where: { doctor: { id: doctorId } },
      relations: ['appointment'],
    });
  }
}
