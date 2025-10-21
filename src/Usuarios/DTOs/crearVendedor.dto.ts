import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CambiarAVendedorDto {
  @IsNotEmpty({ message: 'El nombre del negocio es obligatorio' })
  @IsString()
  NombreNegocio: string;

  @IsOptional()
  @IsNumber()
  CategoriaId?: number;

  @IsOptional()
  @IsString()
  Direccion?: string;

  @IsOptional()
  @IsString()
  Telefono?: string;

  @IsOptional()
  @IsString()
  Horario?: string;

  @IsOptional()
  @IsNumber()
  Comision?: number;
}