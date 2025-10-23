import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CarritoCupon } from './carritocupon.entity';

@Entity('Cupon')
export class Cupon {
  @PrimaryGeneratedColumn()
  CuponId: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  Codigo: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  Descuento: number;

  @Column({ type: 'varchar', length: 20, default: 'porcentaje' })
  TipoDescuento: string; // 'porcentaje' o 'monto'

  @Column({ type: 'datetime', nullable: true })
  FechaExpiracion: Date;

  @Column({ type: 'int', nullable: true })
  UsosMaximos: number;

  @Column({ type: 'int', default: 0 })
  UsosActuales: number;

  @Column({ type: 'bit', default: 0 })
  IsDeleted: boolean;

  @OneToMany(() => CarritoCupon, carritoCupon => carritoCupon.cupon)
  carritosCupones?: CarritoCupon[];
}