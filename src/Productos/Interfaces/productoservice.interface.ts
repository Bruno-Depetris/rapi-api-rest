import { CrearProductoDto } from '../DTOs/crearproducto.dto';
import { ActualizarProductoDto } from '../DTOs/actualizarproducto.dto';

export interface IProductoService {
  crearProducto(
    usuarioId: number,
    crearProductoDto: CrearProductoDto,
  ): Promise<{
    message: string;
    producto: {
      productoId: number;
      vendedorId: number;
      categoriaProductoId?: number;
      nombre: string;
      precio: number;
      descripcion?: string;
      disponibilidad: number;
      imagenes?: string[];
    };
  }>;

  actualizarProducto(
    usuarioId: number,
    productoId: number,
    actualizarProductoDto: ActualizarProductoDto,
  ): Promise<{
    message: string;
    producto: {
      productoId: number;
      vendedorId: number;
      categoriaProductoId?: number;
      nombre: string;
      precio: number;
      descripcion?: string;
      disponibilidad: number;
      imagenes?: string[];
    };
  }>;

  eliminarProducto(usuarioId: number, productoId: number, rol: string): Promise<{
    message: string;
  }>;

  listarProductos(): Promise<
    Array<{
      productoId: number;
      vendedorId: number;
      categoriaProductoId?: number;
      nombre: string;
      precio: number;
      descripcion?: string;
      disponibilidad: number;
      imagenes?: string[];
    }>
  >;

  obtenerMisProductos(usuarioId: number): Promise<
    Array<{
      productoId: number;
      vendedorId: number;
      categoriaProductoId?: number;
      nombre: string;
      precio: number;
      descripcion?: string;
      disponibilidad: number;
      imagenes?: string[];
    }>
  >;

  obtenerProducto(id: number): Promise<{
    productoId: number;
    vendedorId: number;
    categoriaProductoId?: number;
    nombre: string;
    precio: number;
    descripcion?: string;
    disponibilidad: number;
    imagenes?: string[];
  }>;
}