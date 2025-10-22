import { IsOptional, IsString, IsNumber } from 'class-validator';

export class ActualizarNegocioDto {
  @IsOptional()
  @IsString()
  NombreNegocio?: string;

  @IsOptional()
  @IsNumber()
  CategoriaId?: number;
}