import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { SlotService } from 'src/slot/slot.service';

@Controller('doctors')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly slotService: SlotService,
  ) {}

  @Get()
  async getAll(
    @Query('specialization') specialization?: string,
    @Query('name') name?: string,
  ) {
    return this.doctorService.findAll(specialization, name);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const doctor = await this.doctorService.findById(id);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return doctor;
  }

  @Get(':id/available-slots')
  async getAvailableSlots(@Param('id') id: string) {
    const doctor = await this.doctorService.findById(id.trim());
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const slots = await this.slotService.getAvailableSlotsForDoctor(id.trim());
    return slots.map(({ id, startTime, endTime, isBooked }) => ({
      id,
      startTime,
      endTime,
      isBooked,
    }));
  }
}
