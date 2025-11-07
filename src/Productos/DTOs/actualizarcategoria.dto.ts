import { IsOptional, IsString } from 'class-validator';

export class ActualizarCategoriaProductoDto {
  @IsOptional()
  @IsString()
  Nombre?: string;
}