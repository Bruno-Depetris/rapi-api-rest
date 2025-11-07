import { IsNotEmpty, IsString } from 'class-validator';

export class CrearRepartidorDto {
  @IsNotEmpty({ message: 'El vehículo es obligatorio' })
  @IsString()
  Vehiculo: string;
}