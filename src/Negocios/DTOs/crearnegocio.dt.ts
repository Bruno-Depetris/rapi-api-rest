import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CrearNegocioDto {
  @IsNotEmpty({ message: 'El nombre del negocio es obligatorio' })
  @IsString()
  NombreNegocio: string;

  @IsOptional()
  @IsNumber()
  CategoriaId?: number;
}