import { IsNotEmpty, IsString } from 'class-validator';

export class AplicarCuponDto {
  @IsNotEmpty({ message: 'El código del cupón es obligatorio' })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  Codigo: string;
}