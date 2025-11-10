import { CambiarAVendedorDto } from '../DTOs/crearVendedor.dto';
import { CrearRepartidorDto } from '../DTOs/crearRepartidor.dto';

export interface IUsuariosService {
  obtenerPerfil(usuarioId: number): Promise<{
    usuarioId: number;
    nombre: string;
    email: string;
    rol: string;
    direccion: string | null;
    vendedor?: {
      vendedorId: number;
      negocioId: number | null;
      telefono: string | null;
      horario: string | null;
      comision: number | null;
      estado: string; 
    };
    repartidor?: {
      repartidorId: number;
      vehiculo: string | null;
    };
  }>;

  cambiarAVendedor(
    usuarioId: number,
    cambiarDto: CambiarAVendedorDto,
  ): Promise<{
    message: string;
    vendedor: {
      vendedorId: number;
      usuarioId: number;
      negocioId: number | null;
      estado: string;
    };
    negocio: {
      negocioId: number;
      nombreNegocio: string;
      estado: string;
    };
  }>;

  cambiarARepartidor(
    usuarioId: number,
    crearDto: CrearRepartidorDto,
  ): Promise<{
    message: string;
    repartidor: {
      repartidorId: number;
      usuarioId: number;
      vehiculo: string;
    };
  }>;

  listarUsuarios(
    page?: number,
    limit?: number,
  ): Promise<
    Array<{
      usuarioId: number;
      nombre: string;
      email: string;
      rol: string;
      direccion: string | null;
    }>
  >;

  eliminarUsuario(usuarioId: number): Promise<{
    message: string;
  }>;

  listarSolicitudesVendedor(): Promise<
    Array<{
      vendedorId: number;
      usuario: {
        usuarioId: number;
        nombre: string;
        email: string;
      };
      negocio: {
        negocioId: number;
        nombreNegocio: string;
      } | null;
      telefono: string | null;
      direccion: string | null;
      horario: string | null;
      comision: number | null;
      estado: string;
    }>
  >;

  aprobarVendedor(vendedorId: number): Promise<{
    message: string;
    vendedor: {
      vendedorId: number;
      estado: string;
    };
  }>;

  rechazarVendedor(
    vendedorId: number,
    motivo?: string,
  ): Promise<{
    message: string;
    motivo: string;
  }>;
}