export interface IProductoPort {
  validarExiste(productoId: number): Promise<boolean>;
  obtenerDatos(productoId: number): Promise<{
    productoId: number;
    nombre: string;
    precio: number;
    disponibilidad: number;
  } | null>;
  validarStock(productoId: number, cantidad: number): Promise<boolean>;
}