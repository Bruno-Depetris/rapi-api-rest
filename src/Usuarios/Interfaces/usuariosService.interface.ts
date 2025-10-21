import { CambiarAVendedorDto } from '../DTOs/crearVendedor.dto';
import { CrearRepartidorDto } from '../DTOs/crearRepartidor.dto';

export interface IUsuariosService {
  /**
   * 
   * @param usuarioId 
   * @returns 
   */
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
    };
    repartidor?: {
      repartidorId: number;
      vehiculo: string | null;
    };
  }>;

  /**
   * 
   * @param usuarioId 
   * @param cambiarDto 
   * @returns 
   */
  cambiarAVendedor(
    usuarioId: number,
    cambiarDto: CambiarAVendedorDto,
  ): Promise<{
    message: string;
    vendedor: {
      vendedorId: number;
      usuarioId: number;
      negocioId: number | null;
    };
  }>;

  /**
   * 
   * @param usuarioId 
   * @param crearDto 
   * @returns 
   */
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

  /**
   * 
   * @param page 
   * @param limit 
   * @returns 
   */
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

  /**
   * 
   * @param usuarioId ID del usuario a eliminar
   * @returns Confirmación de eliminación
   */
  eliminarUsuario(usuarioId: number): Promise<{
    message: string;
  }>;
}