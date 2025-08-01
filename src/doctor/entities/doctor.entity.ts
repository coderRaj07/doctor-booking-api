import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Slot } from 'src/slot/entities/slot.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  specialization: string;

  @OneToMany(() => Slot, (s) => s.doctor)
  slots: Slot[];

  @OneToMany(() => Appointment, (appt) => appt.doctor)
  appointments: Appointment[];
}
