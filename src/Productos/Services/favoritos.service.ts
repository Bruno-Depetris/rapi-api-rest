import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { FavoritosRepository } from "../Repositories/favoritos.repository";
import { AgregarFavoritoDTO } from "../DTOs/agregarfavorito.dto";
import { Favoritos } from "../Entities/favoritos.entity";

@Injectable()
export class FavoritosService {
  constructor(
    private readonly favoritosRepository: FavoritosRepository,
  ) {}

  async agregarFavorito(dto: AgregarFavoritoDTO): Promise<Favoritos> {
    if (!dto.UsuarioId) {
      throw new NotFoundException('El UsuarioId es requerido');
    }
    const existentes = await this.favoritosRepository.findAllByUsuarioId(dto.UsuarioId);
    const yaExiste = existentes.find(f => f.ProductoId === dto.ProductoId);
    
    if (yaExiste) {
      throw new ConflictException('El producto ya está en favoritos');
    }

    const favorito = await this.favoritosRepository.create({
      UsuarioId: dto.UsuarioId,
      ProductoId: dto.ProductoId,
    });
    
    return favorito;
  }

  async listarFavoritos(usuarioId: number): Promise<Favoritos[]> {
    return await this.favoritosRepository.findAllByUsuarioId(usuarioId);
  }

  async eliminarFavorito(usuarioId: number, productoId: number): Promise<void> {
    const existentes = await this.favoritosRepository.findAllByUsuarioId(usuarioId);
    const favorito = existentes.find(f => f.ProductoId === productoId);
    
    if (!favorito) {
      throw new NotFoundException('El favorito no existe');
    }
    
    await this.favoritosRepository.removeByUsuarioYProducto(usuarioId, productoId);
  }
}