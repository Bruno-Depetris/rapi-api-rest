import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../Entities/categoria.entity';

@Injectable()
export class CategoriaRepository {
  constructor(
    @InjectRepository(Categoria)
    private readonly repository: Repository<Categoria>,
  ) {}

  async create(data: Partial<Categoria>): Promise<Categoria> {
    const categoria = this.repository.create(data);
    return await this.repository.save(categoria);
  }

  async findById(id: number): Promise<Categoria | null> {
    return await this.repository.findOne({
      where: { CategoriaId: id },
    });
  }

  async findByNombre(nombre: string): Promise<Categoria | null> {
    return await this.repository.findOne({
      where: { Categoria: nombre },
    });
  }

  async existsByNombre(nombre: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { Categoria: nombre },
    });
    return count > 0;
  }

  async update(id: number, data: Partial<Categoria>): Promise<Categoria | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findAll(): Promise<Categoria[]> {
    return await this.repository.find();
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }
}