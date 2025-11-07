import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class AgregarItemDto {
  @IsNotEmpty({ message: 'El producto es obligatorio' })
  @IsNumber({}, { message: 'El producto debe ser un número' })
  ProductoId: number;

  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @IsPositive({ message: 'La cantidad debe ser mayor a 0' })
  Cantidad: number;
}