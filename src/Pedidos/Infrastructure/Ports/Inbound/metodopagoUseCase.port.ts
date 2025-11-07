import { CrearMetodoPagoDto } from '../../../Application/DTOs/crearmetodopago.dto';
import { ActualizarMetodoPagoDto } from '../../../Application/DTOs/actualizarmetodopago.dto';

export interface ICrearMetodoPagoUseCase {
  ejecutar(dto: CrearMetodoPagoDto): Promise<{
    message: string;
    metodoPago: {
      metodoId: number;
      metodo: string;
    };
  }>;
}

export interface IObtenerMetodoPagoUseCase {
  ejecutar(metodoId: number): Promise<{
    metodoId: number;
    metodo: string;
  }>;
}

export interface IListarMetodosPagoUseCase {
  ejecutar(): Promise<Array<{
    metodoId: number;
    metodo: string;
  }>>;
}

export interface IActualizarMetodoPagoUseCase {
  ejecutar(metodoId: number, dto: ActualizarMetodoPagoDto): Promise<{
    message: string;
    metodoPago: {
      metodoId: number;
      metodo: string;
    };
  }>;
}

export interface IEliminarMetodoPagoUseCase {
  ejecutar(metodoId: number): Promise<{
    message: string;
  }>;
}