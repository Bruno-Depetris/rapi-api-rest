import { CrearCategoriaDto } from '../DTOs/crearcategoria.dto';
import { ActualizarCategoriaDto } from '../DTOs/actualizarcategoria.dto';

export interface ICategoriasService {
  listarCategorias(): Promise<
    Array<{
      categoriaId: number;
      nombre: string;
    }>
  >;

  obtenerCategoria(id: number): Promise<{
    categoriaId: number;
    nombre: string;
  }>;

  crearCategoria(crearDto: CrearCategoriaDto): Promise<{
    message: string;
    categoria: {
      categoriaId: number;
      nombre: string;
    };
  }>;

  actualizarCategoria(
    id: number,
    actualizarDto: ActualizarCategoriaDto,
  ): Promise<{
    message: string;
    categoria: {
      categoriaId: number;
      nombre: string;
    };
  }>;

  eliminarCategoria(id: number): Promise<{
    message: string;
  }>;
}