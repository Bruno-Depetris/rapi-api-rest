import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IAplicarCuponUseCase } from '../../../Infrastructure/Ports/Inbound/carritoUseCase.port';
import { CarritoRepository } from '../../../Infrastructure/Persistence/carrito.repository';
import { CarritoCuponRepository } from '../../../Infrastructure/Persistence/carritocupon.repository';
import { CarritoItemRepository } from '../../../Infrastructure/Persistence/carritoitem.repository';
import { CuponRepository } from '../../../Infrastructure/Persistence/cupon.repository';
import { AplicarCuponDto } from '../../DTOs/aplicarcupon.dto';

@Injectable()
export class AplicarCuponUseCase implements IAplicarCuponUseCase {
  constructor(
    private readonly carritoRepository: CarritoRepository,
    private readonly carritoCuponRepository: CarritoCuponRepository,
    private readonly carritoItemRepository: CarritoItemRepository,
    private readonly cuponRepository: CuponRepository,
  ) {}

  async ejecutar(usuarioId: number, dto: AplicarCuponDto) {
    const carrito = await this.carritoRepository.findCarritoActivo(usuarioId);
    if (!carrito) {
      throw new NotFoundException('No tienes un carrito activo');
    }

    if (!carrito.items || carrito.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const cupon = await this.cuponRepository.findByCodigo(dto.Codigo);
    if (!cupon) {
      throw new NotFoundException('Cupón no encontrado');
    }

    if (cupon.FechaExpiracion && new Date(cupon.FechaExpiracion) < new Date()) {
      throw new BadRequestException('El cupón ha expirado');
    }

    if (cupon.UsosMaximos && cupon.UsosActuales >= cupon.UsosMaximos) {
      throw new BadRequestException('El cupón ha alcanzado su límite de usos');
    }

    const yaAplicado = await this.carritoCuponRepository.existeCuponEnCarrito(
      carrito.CarritoId,
      cupon.CuponId,
    );
    if (yaAplicado) {
      throw new BadRequestException('Este cupón ya está aplicado');
    }

    let descuentoAplicado = 0;
    const subtotal = Number(carrito.Subtotal);

    if (cupon.TipoDescuento === 'porcentaje') {
      descuentoAplicado = (subtotal * Number(cupon.Descuento)) / 100;
    } else {
      descuentoAplicado = Number(cupon.Descuento);
    }

    await this.carritoCuponRepository.create({
      CarritoId: carrito.CarritoId,
      CuponId: cupon.CuponId,
      DescuentoAplicado: descuentoAplicado,
    });

    await this.cuponRepository.incrementarUso(cupon.CuponId);

    await this.calcularTotales(carrito.CarritoId);

    const carritoActualizado = await this.carritoRepository.findById(carrito.CarritoId);

    return {
      message: 'Cupón aplicado exitosamente',
      cupon: {
        codigo: cupon.Codigo,
        descuentoAplicado: descuentoAplicado,
      },
      carrito: {
        totalDescuentos: Number(carritoActualizado!.TotalDescuentos),
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