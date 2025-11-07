import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import type { IActualizarItemUseCase } from '../../../Infrastructure/Ports/Inbound/carritoUseCase.port';
import type { IProductoPort } from '../../../Infrastructure/Ports/Outbound/producto.port';
import { CarritoRepository } from '../../../Infrastructure/Persistence/carrito.repository';
import { CarritoItemRepository } from '../../../Infrastructure/Persistence/carritoitem.repository';
import { CarritoCuponRepository } from '../../../Infrastructure/Persistence/carritocupon.repository';
import { ActualizarItemDto } from '../../DTOs/actualizarcarrito.dto';

@Injectable()
export class ActualizarItemUseCase implements IActualizarItemUseCase {
  constructor(
    private readonly carritoRepository: CarritoRepository,
    private readonly carritoItemRepository: CarritoItemRepository,
    private readonly carritoCuponRepository: CarritoCuponRepository,
    @Inject('IProductoPort')
    private readonly productoPort: IProductoPort,
  ) {}

  async ejecutar(usuarioId: number, carritoItemId: number, dto: ActualizarItemDto) {
    const item = await this.carritoItemRepository.findById(carritoItemId);
    if (!item) {
      throw new NotFoundException('Item no encontrado');
    }

    // Verificar que el carrito pertenece al usuario
    const carrito = await this.carritoRepository.findById(item.CarritoId);
    if (!carrito || carrito.UsuarioId !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para modificar este carrito');
    }

    if (carrito.Estado !== 'Activo') {
      throw new BadRequestException('No puedes modificar un carrito inactivo');
    }

    // Verificar stock
    const stockDisponible = await this.productoPort.validarStock(item.ProductoId, dto.Cantidad);
    if (!stockDisponible) {
      throw new BadRequestException('Stock insuficiente');
    }

    // Actualizar cantidad
    const nuevoSubtotal = dto.Cantidad * Number(item.PrecioUnitario);
    await this.carritoItemRepository.actualizarCantidad(carritoItemId, dto.Cantidad, nuevoSubtotal);

    // Recalcular totales
    await this.calcularTotales(carrito.CarritoId);

    const carritoActualizado = await this.carritoRepository.findById(carrito.CarritoId);

    return {
      message: 'Cantidad actualizada',
      item: {
        carritoItemId: item.CarritoItemId,
        cantidad: dto.Cantidad,
        subtotal: nuevoSubtotal,
      },
      carrito: {
        total: Number(carritoActualizado!.Total),
      },
    };
  }

  private async calcularTotales(carritoId: number): Promise<void> {
    const subtotal = await this.carritoItemRepository.sumTotalByCarrito(carritoId);
    const totalDescuentos = await this.carritoCuponRepository.sumDescuentosByCarrito(carritoId);
    const total = subtotal - totalDescuentos;

    await this.carritoRepository.actualizarTotales(carritoId, subtotal, totalDescuentos, total);
  }
}