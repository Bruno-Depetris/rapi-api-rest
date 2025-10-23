import { CrearCuponDto } from '../../../Application/DTOs/crearcupon.dto';
import { ActualizarCuponDto } from '../../../Application/DTOs/actualizarcupon.dto';

export interface ICrearCuponUseCase {
  ejecutar(dto: CrearCuponDto): Promise<{
    message: string;
    cupon: {
      cuponId: number;
      codigo: string;
      descuento: number;
      tipoDescuento: string;
    };
  }>;
}

export interface IObtenerCuponUseCase {
  ejecutar(cuponId: number): Promise<{
    cuponId: number;
    codigo: string;
    descuento: number;
    tipoDescuento: string;
    fechaExpiracion: Date | null;
    usosMaximos: number | null;
    usosActuales: number;
  }>;
}

export interface IListarCuponesActivosUseCase {
  ejecutar(): Promise<Array<{
    cuponId: number;
    codigo: string;
    descuento: number;
    tipoDescuento: string;
    fechaExpiracion: Date | null;
  }>>;
}

export interface IListarCuponesUseCase {
  ejecutar(page?: number, limit?: number): Promise<{
    data: Array<{
      cuponId: number;
      codigo: string;
      descuento: number;
      tipoDescuento: string;
      fechaExpiracion: Date | null;
      usosMaximos: number | null;
      usosActuales: number;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

export interface IActualizarCuponUseCase {
  ejecutar(cuponId: number, dto: ActualizarCuponDto): Promise<{
    message: string;
    cupon: {
      cuponId: number;
      codigo: string;
      descuento: number;
      tipoDescuento: string;
    };
  }>;
}

export interface IEliminarCuponUseCase {
  ejecutar(cuponId: number): Promise<{
    message: string;
  }>;
}

export interface IValidarCuponUseCase {
  ejecutar(codigo: string): Promise<{
    valido: boolean;
    mensaje?: string;
    cupon?: {
      cuponId: number;
      codigo: string;
      descuento: number;
      tipoDescuento: string;
    };
  }>;
}