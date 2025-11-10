import { CrearPedidoDto } from '../../../Application/DTOs/crearpedido.dto';

export interface ICrearPedidoUseCase {
  ejecutar(usuarioId: number, dto: CrearPedidoDto): Promise<{
    message: string;
    pedido: {
      pedidoId: number;
      estado: string;
      subtotalProductos: number;
      totalDescuentos: number;
      costoEnvio: number;
      total: number;
      fechaCreacion: Date;
    };
  }>;
}

export interface IObtenerPedidoUseCase {
  ejecutar(pedidoId: number, usuarioId: number, rol: string): Promise<{
    pedidoId: number;
    usuarioId: number;
    carritoId: number | null;
    repartidorId: number | null;
    metodoPagoId: number;
    estado: string;
    subtotalProductos: number;
    totalDescuentos: number;
    costoEnvio: number;
    total: number;
    fechaCreacion: Date;
    fechaEntrega: Date | null;
    resenia: string | null;
    metodoPago: {
      metodoId: number;
      metodo: string;
    } | null;
    detalles: Array<{
      detallePedidoId: number;
      productoId: number;
      nombreProducto: string;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
    }>;
  }>;
}

export interface IListarMisPedidosUseCase {
  ejecutar(usuarioId: number, page?: number, limit?: number): Promise<{
    data: Array<{
      pedidoId: number;
      estado: string;
      total: number;
      fechaCreacion: Date;
      cantidadProductos: number;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

export interface IListarPedidosRepartidorUseCase {
  ejecutar(usuarioId: number, estado?: string, page?: number, limit?: number): Promise<{
    data: Array<{
      pedidoId: number;
      estado: string;
      total: number;
      fechaCreacion: Date;
      misProductos: Array<{
        productoId: number;
        nombre: string;
        cantidad: number;
        subtotal: number;
      }>;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

export interface IListarPedidosVendedorUseCase {
  ejecutar(usuarioId: number, estado?: string, page?: number, limit?: number): Promise<{
    data: Array<{
      pedidoId: number;
      estado: string;
      total: number;
      fechaCreacion: Date;
      misProductos: Array<{
        productoId: number;
        nombre: string;
        cantidad: number;
        subtotal: number;
      }>;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

export interface ITomarPedidoUseCase {
  ejecutar(pedidoId: number, usuarioId: number): Promise<{
    message: string;
    pedido: {
      pedidoId: number;
      repartidorId: number;
      estado: string;
    };
  }>;
}

export interface IEntregarPedidoUseCase {
  ejecutar(pedidoId: number, usuarioId: number): Promise<{
    message: string;
    pedido: {
      pedidoId: number;
      estado: string;
      fechaEntrega: Date;
    };
  }>;
}

export interface ICancelarPedidoUseCase {
  ejecutar(pedidoId: number, usuarioId: number, rol: string): Promise<{
    message: string;
  }>;
}