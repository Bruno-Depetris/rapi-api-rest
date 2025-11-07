import { IsNotEmpty, IsNumber, IsPositive, IsString, IsOptional, IsIn, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearCuponDto {
  @IsNotEmpty({ message: 'El código del cupón es obligatorio' })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  Codigo: string;

  @IsNotEmpty({ message: 'El descuento es obligatorio' })
  @IsNumber({}, { message: 'El descuento debe ser un número' })
  @IsPositive({ message: 'El descuento debe ser mayor a 0' })
  @Max(100, { message: 'El descuento no puede ser mayor a 100' })
  Descuento: number;

  @IsNotEmpty({ message: 'El tipo de descuento es obligatorio' })
  @IsString()
  @IsIn(['porcentaje', 'monto'], { message: 'El tipo debe ser "porcentaje" o "monto"' })
  TipoDescuento: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha de expiración debe ser una fecha válida' })
  FechaExpiracion?: Date;

  @IsOptional()
  @IsNumber({}, { message: 'Los usos máximos deben ser un número' })
  @IsPositive({ message: 'Los usos máximos deben ser mayor a 0' })
  UsosMaximos?: number;
}