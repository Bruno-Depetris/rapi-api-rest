import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { MetodoPago } from './metodopago.entity';
import { DetallePedido } from './detallepedido.entity';
import { Carrito } from './carrito.entity';
import { Usuario } from '../../../Usuarios/Entities/usuario.entity';
import { Repartidor } from '../../../Usuarios/Entities/repartidor.entity';

@Entity('Pedido')
export class Pedido {
  @PrimaryGeneratedColumn()
  PedidoId: number;

  @Column()
  UsuarioId: number; 

  @Column({ nullable: true })
  CarritoId: number;

  @Column({ nullable: true })
  RepartidorId: number;

  @Column()
  MetodoPagoId: number;

  @Column({ type: 'varchar', length: 50, default: 'Pendiente' })
  Estado: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  SubtotalProductos: number; 

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  TotalDescuentos: number; 

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  CostoEnvio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  Total: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  FechaCreacion: Date;

  @Column({ type: 'datetime', nullable: true })
  FechaEntrega: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Resenia: string;

  @Column({ type: 'bit', default: 0 })
  IsDeleted: boolean;

  @ManyToOne(() => MetodoPago)
  @JoinColumn({ name: 'MetodoPagoId' })
  metodoPago?: MetodoPago;

  @ManyToOne(() => Carrito)
  @JoinColumn({ name: 'CarritoId' })
  carrito?: Carrito;

  @OneToMany(() => DetallePedido, detalle => detalle.pedido)
  detalles?: DetallePedido[];

  
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'UsuarioId' })
  usuario?: Usuario;

  @ManyToOne(() => Repartidor)
  @JoinColumn({ name: 'RepartidorId' })
  repartidor?: Repartidor;
}