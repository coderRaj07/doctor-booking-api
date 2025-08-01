import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { SlotModule } from 'src/slot/slot.module';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor]), SlotModule],
  providers: [DoctorService],
  controllers: [DoctorController],
  exports: [TypeOrmModule, DoctorService], // To export the doctor repo module we used TypeOrmModule
})
export class DoctorModule {}
