import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, IsBoolean, Min } from 'class-validator';

export class CrearProductoDto {
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @IsString()
  Nombre: string;

  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @IsNumber()
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  Precio: number;

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