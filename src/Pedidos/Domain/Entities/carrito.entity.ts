import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../../Usuarios/Entities/usuario.entity';
import { CarritoItem } from './carritoitem.entity';
import { CarritoCupon } from './carritocupon.entity';

@Entity('Carrito')
export class Carrito {
  @PrimaryGeneratedColumn()
  CarritoId: number;

  @Column()
  UsuarioId: number;

  @Column({ type: 'varchar', length: 50, default: 'Activo' })
  Estado: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  Subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  TotalDescuentos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  Total: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  FechaCreacion: Date;

  @Column({ type: 'datetime', nullable: true })
  FechaConversion: Date;

  @Column({ type: 'bit', default: 0 })
  IsDeleted: boolean;

  @OneToMany(() => CarritoItem, item => item.carrito)
  items?: CarritoItem[];

  @OneToMany(() => CarritoCupon, carritoCupon => carritoCupon.carrito)
  cupones?: CarritoCupon[];

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'UsuarioId' })
  usuario?: Usuario;
}