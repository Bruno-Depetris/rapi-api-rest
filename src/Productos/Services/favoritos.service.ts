import { Injectable, NotFoundException} from "@nestjs/common";
import { FavoritosRepository } from "../Repositories/favoritos.repository";
import { AgregarFavoritoDTO } from "../DTOs/agregarfavorito.dto";
import { Favoritos } from "../Entities/favoritos.entity";

@Injectable()
export class FavoritosService {
  constructor(
    private readonly favoritosRepository: FavoritosRepository,
  ) {}

  async agregarFavorito(dto: AgregarFavoritoDTO): Promise<Favoritos> {
    const exitentes = await this.favoritosRepository.findAllByUsuarioId(dto.UsuarioId);
    const yaExiste = exitentes.find(f => f.ProductoId === dto.ProductoId);
    if (yaExiste) {
      throw new NotFoundException('El producto ya está en favoritos');
    }

    const favorito = await this.favoritosRepository.create({
      UsuarioId: dto.UsuarioId,
      ProductoId: dto.ProductoId,
    });
    return favorito;
  }

  
}