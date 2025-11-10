import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import type{ ICrearPedidoUseCase } from '../../../Infrastructure/Ports/Inbound/pedidousecase.port';
import type{ IUsuarioPort } from '../../../Infrastructure/Ports/Outbound/usuario.port';
import type{ IRepartidorPort } from '../../../Infrastructure/Ports/Outbound/repartidor.port';
import { PedidoRepository } from '../../../Infrastructure/Persistence/pedido.repository';
import { DetallePedidoRepository } from '../../../Infrastructure/Persistence/detallepedido.repository';
import { CarritoRepository } from '../../../Infrastructure/Persistence/carrito.repository';
import { MetodoPagoRepository } from '../../../Infrastructure/Persistence/metodopago.repository';
import { CrearPedidoDto } from '../../DTOs/crearpedido.dto';
import { In } from 'typeorm';

@Injectable()
export class CrearPedidoUseCase implements ICrearPedidoUseCase {
  constructor(
    @Inject('IUsuarioPort')
    private readonly usuarioPort: IUsuarioPort,
    @Inject('IRepartidorPort')
    private readonly repartidorPort: IRepartidorPort,
    private readonly pedidoRepository: PedidoRepository,
    private readonly detallePedidoRepository: DetallePedidoRepository,
    private readonly carritoRepository: CarritoRepository,
    private readonly metodoPagoRepository: MetodoPagoRepository,
  ) {}

  async ejecutar(usuarioId: number, dto: CrearPedidoDto) {

    const usuarioExiste = await this.usuarioPort.validarExiste(usuarioId);
    if (!usuarioExiste) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const carrito = await this.carritoRepository.findById(dto.CarritoId);
    if (!carrito) {
      throw new NotFoundException('Carrito no encontrado');
    }

    if (carrito.UsuarioId !== usuarioId) {
      throw new ForbiddenException('Este carrito no te pertenece');
    }

    if (carrito.Estado !== 'Activo') {
      throw new BadRequestException('Este carrito ya no está activo');
    }

    if (!carrito.items || carrito.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const metodoPago = await this.metodoPagoRepository.findById(dto.MetodoPagoId);
    if (!metodoPago) {
      throw new NotFoundException('Método de pago no encontrado');
    }

    if (dto.RepartidorId) {
      const repartidorExiste = await this.repartidorPort.validarExiste(dto.RepartidorId);
      if (!repartidorExiste) {
        throw new NotFoundException('Repartidor no encontrado');
      }
    }

    const costoEnvio = this.calcularCostoEnvio();

    const nuevoPedido = await this.pedidoRepository.create({
      UsuarioId: usuarioId,
      CarritoId: carrito.CarritoId,
      MetodoPagoId: dto.MetodoPagoId,
      RepartidorId: dto.RepartidorId,
      Estado: 'Pendiente',
      SubtotalProductos: Number(carrito.Subtotal),
      TotalDescuentos: Number(carrito.TotalDescuentos),
      CostoEnvio: costoEnvio,
      Total: Number(carrito.Total) + costoEnvio,
      Resenia: dto.Resenia,
    });

    const detalles = carrito.items.map((item) => ({
      PedidoId: nuevoPedido.PedidoId,
      ProductoId: item.ProductoId,
      Cantidad: item.Cantidad,
      PrecioUnitario: Number(item.PrecioUnitario),
      Subtotal: Number(item.Subtotal),
    }));

    await this.detallePedidoRepository.createMultiple(detalles);

    await this.carritoRepository.convertirACompra(carrito.CarritoId);

    return {
      message: 'Pedido creado exitosamente',
      pedido: {
        pedidoId: nuevoPedido.PedidoId,
        estado: nuevoPedido.Estado,
        subtotalProductos: Number(nuevoPedido.SubtotalProductos),
        totalDescuentos: Number(nuevoPedido.TotalDescuentos),
        costoEnvio: Number(nuevoPedido.CostoEnvio),
        total: Number(nuevoPedido.Total),
        fechaCreacion: nuevoPedido.FechaCreacion,
      },
    };
  }

  private calcularCostoEnvio(): number {
    return 5000.0;
  }
}