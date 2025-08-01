import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  async book(@Body() dto: CreateAppointmentDto) {
    return this.appointmentService.create(
      dto.doctorId,
      dto.slotId,
      dto.patientName,
    );
  }

  @Get()
  async getAll(
    @Query('patient') patientName?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.appointmentService.getAppointments(
      patientName,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Delete(':id')
  async cancel(@Param('id') id: string) {
    return this.appointmentService.cancelAppointment(id);
  }
}
