import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Negocio } from '../Entities/negocio.entity';

@Injectable()
export class NegocioRepository {
  constructor(
    @InjectRepository(Negocio)
    private readonly repository: Repository<Negocio>,
  ) {}

  async create(data: Partial<Negocio>): Promise<Negocio> {
    const negocio = this.repository.create(data);
    return await this.repository.save(negocio);
  }

  async findById(id: number): Promise<Negocio | null> {
    return await this.repository.findOne({
      where: { NegocioId: id },
      relations: ['categoria'],
    });
  }

  async findByNombre(nombre: string): Promise<Negocio | null> {
    return await this.repository.findOne({
      where: { NombreNegocio: nombre },
      relations: ['categoria'],
    });
  }

  async existsByNombre(nombre: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { NombreNegocio: nombre },
    });
    return count > 0;
  }

  async findByCategoria(categoriaId: number): Promise<Negocio[]> {
    return await this.repository.find({
      where: { CategoriaId: categoriaId },
      relations: ['categoria'],
    });
  }

  async update(id: number, data: Partial<Negocio>): Promise<Negocio | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<Negocio[]> {
    return await this.repository.find({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['categoria'],
    });
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async search(termino: string, page: number = 1, limit: number = 10): Promise<Negocio[]> {
    return await this.repository
      .createQueryBuilder('negocio')
      .leftJoinAndSelect('negocio.categoria', 'categoria')
      .where('negocio.NombreNegocio LIKE :termino', { termino: `%${termino}%` })
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }
}
