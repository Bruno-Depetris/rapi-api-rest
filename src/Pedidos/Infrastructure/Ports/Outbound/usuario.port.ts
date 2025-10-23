export interface IUsuarioPort {
  validarExiste(usuarioId: number): Promise<boolean>;
  obtenerDatos(usuarioId: number): Promise<{
    usuarioId: number;
    nombre: string;
    direccion: string;
  }>;
}