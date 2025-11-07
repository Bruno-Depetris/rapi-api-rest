import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../Entities/usuario.entity';

@Injectable()
export class UsuarioRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly repository: Repository<Usuario>,
  ) {}

  async create(data: Partial<Usuario>): Promise<Usuario> {
    const usuario = this.repository.create(data);
    return await this.repository.save(usuario);
  }

  async findById(id: number): Promise<Usuario | null> {
    return await this.repository.findOne({
      where: { UsuarioId: id },
      relations: ['vendedor', 'repartidor'], 
    });
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return await this.repository.findOne({
      where: { Email: email },
      relations: ['vendedor', 'repartidor'],
    });
  }


  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { Email: email },
    });
    return count > 0;
  }


  async update(id: number, data: Partial<Usuario>): Promise<Usuario | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async updateRol(id: number, rol: string): Promise<void> {
    await this.repository.update(id, { Rol: rol });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<Usuario[]> {
    return await this.repository.find({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['vendedor', 'repartidor'],
    });
  }
}