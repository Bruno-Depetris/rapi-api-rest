import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Carrito } from './carrito.entity';
import { Producto } from '../../../Productos/Entities/producto.entity';

@Entity('CarritoItem')
export class CarritoItem {
  @PrimaryGeneratedColumn()
  CarritoItemId: number;

  @Column()
  CarritoId: number;

  @Column()
  ProductoId: number;

  @Column({ type: 'int' })
  Cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  PrecioUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  Subtotal: number;

  @Column({ type: 'bit', default: 0 })
  IsDeleted: boolean;

  @ManyToOne(() => Carrito, carrito => carrito.items)
  @JoinColumn({ name: 'CarritoId' })
  carrito: Carrito;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'ProductoId' })
  producto?: Producto;
}