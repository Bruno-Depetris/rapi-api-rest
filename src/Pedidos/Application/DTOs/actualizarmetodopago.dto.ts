import { IsOptional, IsString } from 'class-validator';

export class ActualizarMetodoPagoDto {
  @IsOptional()
  @IsString()
  Metodo?: string;
}