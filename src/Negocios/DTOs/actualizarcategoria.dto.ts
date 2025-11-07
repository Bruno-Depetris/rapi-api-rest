import { IsOptional, IsString } from 'class-validator';

export class ActualizarCategoriaDto {
  @IsOptional()
  @IsString()
  Categoria?: string;
}