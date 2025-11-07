import { IsNotEmpty, IsString } from 'class-validator';

export class CrearCategoriaProductoDto {
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  @IsString()
  Nombre: string;
}