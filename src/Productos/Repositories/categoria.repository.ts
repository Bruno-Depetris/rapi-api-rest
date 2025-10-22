import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaProducto } from '../Entities/categoriaproducto.entity';

@Injectable()
export class CategoriaProductoRepository {
  constructor(
    @InjectRepository(CategoriaProducto)
    private readonly repository: Repository<CategoriaProducto>,
  ) {}

  async create(data: Partial<CategoriaProducto>): Promise<CategoriaProducto> {
    const categoria = this.repository.create(data);
    return await this.repository.save(categoria);
  }

  async findById(id: number): Promise<CategoriaProducto | null> {
    return await this.repository.findOne({
      where: { CategoriaProductoId: id },
    });
  }

  async findByNombre(nombre: string): Promise<CategoriaProducto | null> {
    return await this.repository.findOne({
      where: { Nombre: nombre },
    });
  }

  async existsByNombre(nombre: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { Nombre: nombre },
    });
    return count > 0;
  }

  async update(id: number, data: Partial<CategoriaProducto>): Promise<CategoriaProducto | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findAll(): Promise<CategoriaProducto[]> {
    return await this.repository.find();
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }
}