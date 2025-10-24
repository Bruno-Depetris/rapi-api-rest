import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendedor } from '../Entities/vendedor.entity';

@Injectable()
export class VendedorRepository {
  constructor(
    @InjectRepository(Vendedor)
    private readonly repository: Repository<Vendedor>,
  ) {}

  async create(data: Partial<Vendedor>): Promise<Vendedor> {
    const vendedor = this.repository.create(data);
    return await this.repository.save(vendedor);
  }

  async findById(id: number): Promise<Vendedor | null> {
    return await this.repository.findOne({
      where: { VendedorId: id },
      relations: ['usuario', 'negocio'],
    });
  }

  async findByUsuarioId(usuarioId: number): Promise<Vendedor | null> {
    return await this.repository.findOne({
      where: { UsuarioId: usuarioId },
      relations: ['usuario', 'negocio'],
    });
  }

  async existsByUsuarioId(usuarioId: number): Promise<boolean> {
    const count = await this.repository.count({
      where: { UsuarioId: usuarioId },
    });
    return count > 0;
  }

  async update(id: number, data: Partial<Vendedor>): Promise<Vendedor | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findByEstado(estado: string): Promise<Vendedor[]> {
  return await this.repository.find({
    where: { Estado: estado },
    relations: ['usuario', 'negocio'],
    order: { VendedorId: 'DESC' },
  });
}

async updateEstado(id: number, estado: string): Promise<void> {
  await this.repository.update(id, { Estado: estado });
}

  async findAll(page: number = 1, limit: number = 10): Promise<Vendedor[]> {
    return await this.repository.find({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['usuario', 'negocio'],
    });
  }

  async findByNegocioId(negocioId: number): Promise<Vendedor[]> {
    return await this.repository.find({
      where: { NegocioId: negocioId },
      relations: ['usuario'],
    });
  }
}