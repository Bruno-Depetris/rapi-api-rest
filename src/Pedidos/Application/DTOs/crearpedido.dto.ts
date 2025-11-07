import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CrearPedidoDto {
  @IsNotEmpty({ message: 'El carrito es obligatorio' })
  @IsNumber({}, { message: 'El carrito debe ser un número' })
  CarritoId: number;

  @IsNotEmpty({ message: 'El método de pago es obligatorio' })
  @IsNumber({}, { message: 'El método de pago debe ser un número' })
  MetodoPagoId: number;

  @IsOptional()
  @IsNumber({}, { message: 'El repartidor debe ser un número' })
  RepartidorId?: number;

  @IsOptional()
  @IsString()
  Resenia?: string;
}