import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../Entities/producto.entity';

@Injectable()
export class ProductoRepository {
  constructor(
    @InjectRepository(Producto)
    private readonly repository: Repository<Producto>,
  ) {}

  async create(data: Partial<Producto>): Promise<Producto> {
    const producto = this.repository.create(data);
    return await this.repository.save(producto);
  }

  async findById(id: number): Promise<Producto | null> {
    return await this.repository.findOne({
      where: { ProductoId: id, IsDeleted: 0 },
      relations: ['vendedor', 'categoriaProducto'],
    });
  }

  async findByVendedorId(vendedorId: number): Promise<Producto[]> {
    return await this.repository.find({
      where: { VendedorId: vendedorId, IsDeleted: 0 },
      relations: ['categoriaProducto'],
    });
  }

  async findByNegocio(negocioId: number): Promise<Producto[]> {
    return await this.repository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.vendedor', 'vendedor')
      .leftJoinAndSelect('producto.categoriaProducto', 'categoriaProducto')
      .where('vendedor.NegocioId = :negocioId', { negocioId })
      .andWhere('producto.IsDeleted = 0')
      .getMany();
  }

  async findByCategoria(categoriaId: number): Promise<Producto[]> {
    return await this.repository.find({
      where: { CategoriaProductoId: categoriaId, IsDeleted: 0 },
      relations: ['vendedor', 'categoriaProducto'],
    });
  }

  async findByNombre(nombre: string): Promise<Producto | null> {
    return await this.repository.findOne({
      where: { Nombre: nombre, IsDeleted: 0 },
      relations: ['categoriaProducto'],
    });
  }

  async update(id: number, data: Partial<Producto>): Promise<Producto | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.update(id, { IsDeleted: 1 });
  }

  async hardDelete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<Producto[]> {
    return await this.repository.find({
      where: { IsDeleted: 0 },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['vendedor', 'categoriaProducto'],
    });
  }

  async search(termino: string, page: number = 1, limit: number = 10): Promise<Producto[]> {
    return await this.repository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.vendedor', 'vendedor')
      .leftJoinAndSelect('producto.categoriaProducto', 'categoriaProducto')
      .where('producto.IsDeleted = 0')
      .andWhere('producto.Nombre LIKE :termino', { termino: `%${termino}%` })
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }

  async count(): Promise<number> {
    return await this.repository.count({
      where: { IsDeleted: 0 },
    });
  }

  async countByVendedor(vendedorId: number): Promise<number> {
    return await this.repository.count({
      where: { VendedorId: vendedorId, IsDeleted: 0 },
    });
  }

  async toggleDisponibilidad(id: number, disponibilidad: number): Promise<void> {
    await this.repository.update(id, { Disponibilidad: disponibilidad });
  }
}