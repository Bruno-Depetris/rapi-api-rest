export interface IRepartidorPort {
  validarExiste(repartidorId: number): Promise<boolean>;
  obtenerPorUsuarioId(usuarioId: number): Promise<{
    repartidorId: number;
    vehiculo: string;
  } | null>;
  obtenerDireccionEntrega(usuarioId: number): Promise<string>;
}