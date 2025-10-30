import { IsInt, isNotEmpty } from "class-validator";

export class AgregarFavoritoDTO {
  @IsInt()
  UsuarioId: number;
  @IsInt()
  ProductoId: number;
}