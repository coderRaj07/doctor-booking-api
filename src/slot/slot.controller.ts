import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  //   Req,
  //   UseGuards,
} from '@nestjs/common';
import { SlotService } from './slot.service';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateSlotDto } from './dto/create-slot.dto';

@Controller('slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Post(':doctorId')
  async createSlot(
    @Param('doctorId') doctorId: string,
    @Body() dto: CreateSlotDto,
  ) {
    return this.slotService.createSlot(doctorId, dto);
  }

  @Get('/doctor/:id/available')
  async getAvailableSlots(@Param('id') doctorId: string) {
    return this.slotService.getAvailableSlotsForDoctor(doctorId);
  }

  @Get('/doctor/:id/all')
  async getAllSlots(@Param('id') doctorId: string) {
    return this.slotService.getAllSlotsForDoctor(doctorId);
  }
}
