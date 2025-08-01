// src/doctor/doctor.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
  ) {}

  async findAll(specialization?: string, name?: string, page = 1, limit = 10) {
    const query = this.doctorRepo.createQueryBuilder('doctor');

    if (specialization) {
      query.andWhere('doctor.specialization ILIKE :specialization', {
        specialization: `%${specialization}%`,
      });
    }

    if (name) {
      query.andWhere('doctor.name ILIKE :name', {
        name: `%${name}%`,
      });
    }

    query.orderBy('doctor.name', 'ASC');

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

  async findById(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepo.findOne({ where: { id } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return doctor;
  }
}
