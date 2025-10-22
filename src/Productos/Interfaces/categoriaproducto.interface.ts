import { CrearCategoriaProductoDto } from '../DTOs/crearcategoria.dto';
import { ActualizarCategoriaProductoDto } from '../DTOs/actualizarcategoria.dto';

export interface ICategoriasProductosService {
  listarCategorias(): Promise<
    Array<{
      categoriaProductoId: number;
      nombre: string;
    }>
  >;

  obtenerCategoria(id: number): Promise<{
    categoriaProductoId: number;
    nombre: string;
  }>;

  crearCategoria(crearDto: CrearCategoriaProductoDto): Promise<{
    message: string;
    categoria: {
      categoriaProductoId: number;
      nombre: string;
    };
  }>;

  actualizarCategoria(
    id: number,
    actualizarDto: ActualizarCategoriaProductoDto,
  ): Promise<{
    message: string;
    categoria: {
      categoriaProductoId: number;
      nombre: string;
    };
  }>;

  eliminarCategoria(id: number): Promise<{
    message: string;
  }>;
}