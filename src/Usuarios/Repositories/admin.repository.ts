import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Administrador } from '../Entities/admin.entity';

@Injectable()
export class AdministradorRepository {
  constructor(
    @InjectRepository(Administrador)
    private readonly repository: Repository<Administrador>,
  ) {}

  async create(data: Partial<Administrador>): Promise<Administrador> {
    const admin = this.repository.create(data);
    return await this.repository.save(admin);
  }

  async findById(id: number): Promise<Administrador | null> {
    return await this.repository.findOne({
      where: { AdministradorID: id },
    });
  }

  async findByUsuario(usuario: string): Promise<Administrador | null> {
    return await this.repository.findOne({
      where: { Usuario: usuario },
    });
  }

  async existsByUsuario(usuario: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { Usuario: usuario },
    });
    return count > 0;
  }

  async update(id: number, data: Partial<Administrador>): Promise<Administrador | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findAll(): Promise<Administrador[]> {
    return await this.repository.find();
  }

}