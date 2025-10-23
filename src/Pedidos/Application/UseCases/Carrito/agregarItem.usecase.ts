import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IAgregarItemUseCase } from '../../../Infrastructure/Ports/Inbound/carritoUseCase.port';
import type { IProductoPort } from '../../../Infrastructure/Ports/Outbound/producto.port';
import { CarritoRepository } from '../../../Infrastructure/Persistence/carrito.repository';
import { CarritoItemRepository } from '../../../Infrastructure/Persistence/carritoitem.repository';
import { AgregarItemDto } from '../../DTOs/agregaritem.dto';

@Injectable()
export class AgregarItemUseCase implements IAgregarItemUseCase {
  constructor(
    private readonly carritoRepository: CarritoRepository,
    private readonly carritoItemRepository: CarritoItemRepository,
    private readonly productoPort: IProductoPort,
  ) {}

  async ejecutar(usuarioId: number, dto: AgregarItemDto) {
    // Verificar que el producto existe
    const producto = await this.productoPort.obtenerDatos(dto.ProductoId);
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar disponibilidad
    const stockDisponible = await this.productoPort.validarStock(dto.ProductoId, dto.Cantidad);
    if (!stockDisponible) {
      throw new BadRequestException('Stock insuficiente');
    }

    // Obtener o crear carrito activo
    let carrito = await this.carritoRepository.findCarritoActivo(usuarioId);
    if (!carrito) {
      carrito = await this.carritoRepository.create({
        UsuarioId: usuarioId,
        Estado: 'Activo',
      });
    }

    // Verificar si el producto ya está en el carrito
    const itemExistente = await this.carritoItemRepository.findByCarritoYProducto(
      carrito.CarritoId,
      dto.ProductoId,
    );

    if (itemExistente) {
      // Actualizar cantidad
      const nuevaCantidad = itemExistente.Cantidad + dto.Cantidad;
      const nuevoSubtotal = nuevaCantidad * producto.precio;

      await this.carritoItemRepository.actualizarCantidad(
        itemExistente.CarritoItemId,
        nuevaCantidad,
        nuevoSubtotal,
      );
    } else {
      // Crear nuevo item
      const subtotal = dto.Cantidad * producto.precio;
      await this.carritoItemRepository.create({
        CarritoId: carrito.CarritoId,
        ProductoId: dto.ProductoId,
        Cantidad: dto.Cantidad,
        PrecioUnitario: producto.precio,
        Subtotal: subtotal,
      });
    }

    await this.calcularTotales(carrito.CarritoId);

    const carritoActualizado = await this.carritoRepository.findById(carrito.CarritoId);

    return {
      message: 'Producto agregado al carrito',
      carrito: {
        carritoId: carritoActualizado!.CarritoId,
        totalItems: carritoActualizado!.items?.length || 0,
        total: Number(carritoActualizado!.Total),
      },
    };
  }

  private async calcularTotales(carritoId: number): Promise<void> {
    const subtotal = await this.carritoItemRepository.sumTotalByCarrito(carritoId);
    const totalDescuentos = 0; // Se calculará con cupones
    const total = subtotal - totalDescuentos;

    await this.carritoRepository.actualizarTotales(carritoId, subtotal, totalDescuentos, total);
  }
}