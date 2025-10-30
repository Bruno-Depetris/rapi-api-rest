import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favoritos } from '../Entities/favoritos.entity';

@Injectable()
export class FavoritosRepository {
  constructor(
    @InjectRepository(Favoritos)
    private readonly repository: Repository<Favoritos>,
  ) {}

  async create(data: Partial<Favoritos>): Promise<Favoritos> {
    const favorito = this.repository.create(data);
    return await this.repository.save(favorito);
  }

  async findAllByUsuarioId(usuarioId: number): Promise<Favoritos[]> {
    return await this.repository.find({
      where: { UsuarioId: usuarioId},
      relations: ['producto', 'producto.vendedor', 'producto.categoriaProducto'],
    });
  }

  async removeByUsuarioYProducto(usuarioId: number, productoId: number): Promise<void> {
    await this.repository.delete({ UsuarioId: usuarioId, ProductoId: productoId });
  }
}
