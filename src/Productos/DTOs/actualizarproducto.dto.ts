import { IsOptional, IsString, IsNumber, IsArray, Min } from 'class-validator';

export class ActualizarProductoDto {
  @IsOptional()
  @IsString()
  Nombre?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  Precio?: number;

  @IsOptional()
  @IsString()
  Descripcion?: string;

  @IsOptional()
  @IsNumber()
  Disponibilidad?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  Imagenes?: string[];

  @IsOptional()
  @IsNumber()
  CategoriaProductoId?: number;
}
