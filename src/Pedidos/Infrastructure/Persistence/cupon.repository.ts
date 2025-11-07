import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cupon } from '../../Domain/Entities/cupon.entity';

@Injectable()
export class CuponRepository {
  constructor(
    @InjectRepository(Cupon)
    private readonly repository: Repository<Cupon>,
  ) {}

  async create(data: Partial<Cupon>): Promise<Cupon> {
    const cupon = this.repository.create(data);
    return await this.repository.save(cupon);
  }

  async findById(id: number): Promise<Cupon | null> {
    return await this.repository.findOne({
      where: { CuponId: id, IsDeleted: false },
    });
  }

  async findByCodigo(codigo: string): Promise<Cupon | null> {
    return await this.repository.findOne({
      where: { Codigo: codigo, IsDeleted: false },
    });
  }

  async existsByCodigo(codigo: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { Codigo: codigo, IsDeleted: false },
    });
    return count > 0;
  }

  async findActivos(): Promise<Cupon[]> {
    return await this.repository
      .createQueryBuilder('cupon')
      .where('cupon.IsDeleted = false')
      .andWhere('(cupon.FechaExpiracion IS NULL OR cupon.FechaExpiracion > NOW())')
      .andWhere('(cupon.UsosMaximos IS NULL OR cupon.UsosActuales < cupon.UsosMaximos)')
      .getMany();
  }

  async update(id: number, data: Partial<Cupon>): Promise<Cupon | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async incrementarUso(id: number): Promise<void> {
    await this.repository.increment({ CuponId: id }, 'UsosActuales', 1);
  }

  async decrementarUso(id: number): Promise<void> {
    await this.repository.decrement({ CuponId: id }, 'UsosActuales', 1);
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.update(id, { IsDeleted: true });
  }

  async findAll(page: number = 1, limit: number = 10): Promise<Cupon[]> {
    return await this.repository.find({
      where: { IsDeleted: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { FechaExpiracion: 'ASC' },
    });
  }

  async count(): Promise<number> {
    return await this.repository.count({
      where: { IsDeleted: false },
    });
  }
}