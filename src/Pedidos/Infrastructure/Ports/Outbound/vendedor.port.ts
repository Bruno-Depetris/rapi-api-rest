export interface IVendedorPort {
  obtenerPorUsuarioId(usuarioId: number): Promise<{
    vendedorId: number;
    negocioId: number;
  } | null>;
  validarTieneProductoEnPedido(vendedorId: number, pedidoId: number): Promise<boolean>;
}