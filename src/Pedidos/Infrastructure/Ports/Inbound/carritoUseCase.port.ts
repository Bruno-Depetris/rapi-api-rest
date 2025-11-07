import { AgregarItemDto } from '../../../Application/DTOs/agregaritem.dto';
import { ActualizarItemDto } from '../../../Application/DTOs/actualizarcarrito.dto';
import { AplicarCuponDto } from '../../../Application/DTOs/aplicarcupon.dto';

export interface IObtenerCarritoUseCase {
  ejecutar(usuarioId: number): Promise<{
    carritoId: number;
    usuarioId: number;
    estado: string;
    subtotal: number;
    totalDescuentos: number;
    total: number;
    fechaCreacion: Date;
    items: Array<{
      carritoItemId: number;
      productoId: number;
      nombre: string;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
    }>;
    cupones: Array<{
      carritoCuponId: number;
      codigo: string;
      descuentoAplicado: number;
    }>;
  }>;
}

export interface IAgregarItemUseCase {
  ejecutar(usuarioId: number, dto: AgregarItemDto): Promise<{
    message: string;
    carrito: {
      carritoId: number;
      totalItems: number;
      total: number;
    };
  }>;
}

export interface IActualizarItemUseCase {
  ejecutar(usuarioId: number, carritoItemId: number, dto: ActualizarItemDto): Promise<{
    message: string;
    item: {
      carritoItemId: number;
      cantidad: number;
      subtotal: number;
    };
    carrito: {
      total: number;
    };
  }>;
}

export interface IEliminarItemUseCase {
  ejecutar(usuarioId: number, carritoItemId: number): Promise<{
    message: string;
  }>;
}

export interface IVaciarCarritoUseCase {
  ejecutar(usuarioId: number): Promise<{
    message: string;
  }>;
}

export interface IAplicarCuponUseCase {
  ejecutar(usuarioId: number, dto: AplicarCuponDto): Promise<{
    message: string;
    cupon: {
      codigo: string;
      descuentoAplicado: number;
    };
    carrito: {
      totalDescuentos: number;
      total: number;
    };
  }>;
}

export interface IRemoverCuponUseCase {
  ejecutar(usuarioId: number, carritoCuponId: number): Promise<{
    message: string;
    carrito: {
      totalDescuentos: number;
      total: number;
    };
  }>;
}