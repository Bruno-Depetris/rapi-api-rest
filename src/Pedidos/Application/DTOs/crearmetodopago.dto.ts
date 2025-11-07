import { IsNotEmpty, IsString } from 'class-validator';

export class CrearMetodoPagoDto {
  @IsNotEmpty({ message: 'El nombre del método de pago es obligatorio' })
  @IsString()
  Metodo: string;
}