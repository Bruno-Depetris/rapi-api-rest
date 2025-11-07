import { IsOptional, IsString, IsIn, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class ActualizarPedidoDto {
  @IsOptional()
  @IsString()
  @IsIn(['Pendiente', 'Preparando', 'EnCamino', 'Entregado', 'Cancelado'], {
    message: 'Estado inválido'
  })
  Estado?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El repartidor debe ser un número' })
  RepartidorId?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha de entrega debe ser una fecha válida' })
  FechaEntrega?: Date;

  @IsOptional()
  @IsString()
  Resenia?: string;
}