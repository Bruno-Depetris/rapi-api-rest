import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarritoCupon } from '../../Domain/Entities/carritocupon.entity';

@Injectable()
export class CarritoCuponRepository {
  constructor(
    @InjectRepository(CarritoCupon)
    private readonly repository: Repository<CarritoCupon>,
  ) {}

  async create(data: Partial<CarritoCupon>): Promise<CarritoCupon> {
    const carritoCupon = this.repository.create(data);
    return await this.repository.save(carritoCupon);
  }

  async findById(id: number): Promise<CarritoCupon | null> {
    return await this.repository.findOne({
      where: { CarritoCuponId: id, IsDeleted: false },
      relations: ['carrito', 'cupon'],
    });
  }

  async findByCarritoId(carritoId: number): Promise<CarritoCupon[]> {
    return await this.repository.find({
      where: { CarritoId: carritoId, IsDeleted: false },
      relations: ['cupon'],
    });
  }

  async findByCarritoYCupon(
    carritoId: number,
    cuponId: number,
  ): Promise<CarritoCupon | null> {
    return await this.repository.findOne({
      where: {
        CarritoId: carritoId,
        CuponId: cuponId,
        IsDeleted: false,
      },
      relations: ['cupon'],
    });
  }

  async existeCuponEnCarrito(carritoId: number, cuponId: number): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        CarritoId: carritoId,
        CuponId: cuponId,
        IsDeleted: false,
      },
    });
    return count > 0;
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.update(id, { IsDeleted: true });
  }

  async deleteByCarritoId(carritoId: number): Promise<void> {
    await this.repository.update(
      { CarritoId: carritoId },
      { IsDeleted: true },
    );
  }

  async sumDescuentosByCarrito(carritoId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('carritoCupon')
      .select('SUM(carritoCupon.DescuentoAplicado)', 'total')
      .where('carritoCupon.CarritoId = :carritoId', { carritoId })
      .andWhere('carritoCupon.IsDeleted = false')
      .getRawOne();

    return result?.total ? parseFloat(result.total) : 0;
  }

  async countByCarrito(carritoId: number): Promise<number> {
    return await this.repository.count({
      where: { CarritoId: carritoId, IsDeleted: false },
    });
  }
}