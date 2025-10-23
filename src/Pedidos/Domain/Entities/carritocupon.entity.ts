import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Carrito } from './carrito.entity';
import { Cupon } from './cupon.entity';

@Entity('CarritoCupon')
export class CarritoCupon {
  @PrimaryGeneratedColumn()
  CarritoCuponId: number;

  @Column()
  CarritoId: number;

  @Column()
  CuponId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  DescuentoAplicado: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  FechaAplicacion: Date;

  @Column({ type: 'bit', default: 0 })
  IsDeleted: boolean;

  // Relaciones
  @ManyToOne(() => Carrito, carrito => carrito.cupones)
  @JoinColumn({ name: 'CarritoId' })
  carrito: Carrito;

  @ManyToOne(() => Cupon, cupon => cupon.carritosCupones)
  @JoinColumn({ name: 'CuponId' })
  cupon: Cupon;
}