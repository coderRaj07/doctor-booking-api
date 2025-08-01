// src/slot/slot.module.ts
import { Module } from '@nestjs/common';
import { SlotService } from './slot.service';
import { SlotController } from './slot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slot } from './entities/slot.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Slot, Doctor])],
  controllers: [SlotController],
  providers: [SlotService],
  exports: [SlotService],
})
export class SlotModule {}
