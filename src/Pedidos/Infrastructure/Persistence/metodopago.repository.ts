import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetodoPago } from '../../Domain/Entities/metodopago.entity';

@Injectable()
export class MetodoPagoRepository {
  constructor(
    @InjectRepository(MetodoPago)
    private readonly repository: Repository<MetodoPago>,
  ) {}

  async create(data: Partial<MetodoPago>): Promise<MetodoPago> {
    const metodoPago = this.repository.create(data);
    return await this.repository.save(metodoPago);
  }

  async findById(id: number): Promise<MetodoPago | null> {
    return await this.repository.findOne({
      where: { MetodoId: id, IsDeleted: false },
    });
  }

  async findByNombre(nombre: string): Promise<MetodoPago | null> {
    return await this.repository.findOne({
      where: { Metodo: nombre, IsDeleted: false },
    });
  }

  async existsByNombre(nombre: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { Metodo: nombre, IsDeleted: false },
    });
    return count > 0;
  }

  async update(id: number, data: Partial<MetodoPago>): Promise<MetodoPago | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.update(id, { IsDeleted: true });
  }

  async findAll(): Promise<MetodoPago[]> {
    return await this.repository.find({
      where: { IsDeleted: false },
      order: { Metodo: 'ASC' },
    });
  }

  async count(): Promise<number> {
    return await this.repository.count({
      where: { IsDeleted: false },
    });
  }
}