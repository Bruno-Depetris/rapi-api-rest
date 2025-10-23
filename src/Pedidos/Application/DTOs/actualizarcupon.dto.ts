import { IsOptional, IsNumber, IsPositive, IsString, IsIn, IsDate, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ActualizarCuponDto {
  @IsOptional()
  @IsString()
  Codigo?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El descuento debe ser un número' })
  @IsPositive({ message: 'El descuento debe ser mayor a 0' })
  @Max(100, { message: 'El descuento no puede ser mayor a 100' })
  Descuento?: number;

  @IsOptional()
  @IsString()
  @IsIn(['porcentaje', 'monto'], { message: 'El tipo debe ser "porcentaje" o "monto"' })
  TipoDescuento?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha de expiración debe ser una fecha válida' })
  FechaExpiracion?: Date;

  @IsOptional()
  @IsNumber({}, { message: 'Los usos máximos deben ser un número' })
  @IsPositive({ message: 'Los usos máximos deben ser mayor a 0' })
  UsosMaximos?: number;
}