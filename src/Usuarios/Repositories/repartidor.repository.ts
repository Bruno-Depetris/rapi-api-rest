import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repartidor } from '../Entities/repartidor.entity';

@Injectable()
export class RepartidorRepository {
  constructor(
    @InjectRepository(Repartidor)
    private readonly repository: Repository<Repartidor>,
  ) {}

  // Crear repartidor
  async create(data: Partial<Repartidor>): Promise<Repartidor> {
    const repartidor = this.repository.create(data);
    return await this.repository.save(repartidor);
  }

  // Buscar por ID
  async findById(id: number): Promise<Repartidor | null> {
    return await this.repository.findOne({
      where: { RepartidorId: id },
      relations: ['usuario'],
    });
  }

  // Buscar por UsuarioId
  async findByUsuarioId(usuarioId: number): Promise<Repartidor | null> {
    return await this.repository.findOne({
      where: { UsuarioId: usuarioId },
      relations: ['usuario'],
    });
  }

  // Verificar si un usuario ya es repartidor
  async existsByUsuarioId(usuarioId: number): Promise<boolean> {
    const count = await this.repository.count({
      where: { UsuarioId: usuarioId },
    });
    return count > 0;
  }

  // Actualizar repartidor
  async update(id: number, data: Partial<Repartidor>): Promise<Repartidor | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  // Eliminar repartidor
  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  // Listar todos los repartidores
  async findAll(page: number = 1, limit: number = 10): Promise<Repartidor[]> {
    return await this.repository.find({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['usuario'],
    });
  }

  // Buscar repartidores por tipo de vehículo
  async findByVehiculo(vehiculo: string): Promise<Repartidor[]> {
    return await this.repository.find({
      where: { Vehiculo: vehiculo },
      relations: ['usuario'],
    });
  }
}