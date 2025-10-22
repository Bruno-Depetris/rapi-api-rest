import { ActualizarNegocioDto } from '../DTOs/actualizarnegocio.dto';

export interface INegociosService {
  listarNegocios(page?: number, limit?: number): Promise<{
    data: Array<{
      negocioId: number;
      nombreNegocio: string;
      categoriaId: number | null;
      categoria: {
        categoriaId: number;
        nombre: string;
      } | null;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  buscarNegocios(termino: string, page?: number, limit?: number): Promise<{
    data: Array<{
      negocioId: number;
      nombreNegocio: string;
      categoriaId: number | null;
      categoria: {
        categoriaId: number;
        nombre: string;
      } | null;
    }>;
    termino: string;
    page: number;
    limit: number;
  }>;

  obtenerNegocio(id: number): Promise<{
    negocioId: number;
    nombreNegocio: string;
    categoriaId: number | null;
    categoria: {
      categoriaId: number;
      nombre: string;
    } | null;
  }>;

  obtenerMiNegocio(usuarioId: number): Promise<{
    negocioId: number;
    nombreNegocio: string;
    categoriaId: number | null;
    categoria: {
      categoriaId: number;
      nombre: string;
    } | null;
    vendedor: {
      vendedorId: number;
      telefono: string | null;
      horario: string | null;
      direccion: string | null;
    };
  }>;

  actualizarNegocio(
    negocioId: number,
    usuarioId: number,
    rol: string,
    actualizarDto: ActualizarNegocioDto,
  ): Promise<{
    message: string;
    negocio: {
      negocioId: number;
      nombreNegocio: string;
      categoriaId: number | null;
    };
  }>;

  eliminarNegocio(
    negocioId: number,
    usuarioId: number,
    rol: string,
  ): Promise<{
    message: string;
  }>;

  listarPorCategoria(categoriaId: number): Promise<
    Array<{
      negocioId: number;
      nombreNegocio: string;
      categoriaId: number | null;
      categoria: {
        categoriaId: number;
        nombre: string;
      } | null;
    }>
  >;
}