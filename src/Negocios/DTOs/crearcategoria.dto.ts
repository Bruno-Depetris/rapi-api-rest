import { IsNotEmpty, IsString } from 'class-validator';

export class CrearCategoriaDto {
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  @IsString()
  Categoria: string;
}
