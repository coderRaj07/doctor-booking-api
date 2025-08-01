import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { Slot } from 'src/slot/entities/slot.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, {
    onDelete: 'CASCADE',
  })
  doctor: Doctor;

  @OneToOne(() => Slot, (slot) => slot.appointment)
  @JoinColumn()
  slot: Slot;

  @Column()
  patientName: string;

  @Column({ default: false })
  isCancelled: boolean;
}
