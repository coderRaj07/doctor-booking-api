import { IsUUID, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  doctorId: string;

  @IsUUID()
  slotId: string;

  @IsString()
  patientName: string;
}
