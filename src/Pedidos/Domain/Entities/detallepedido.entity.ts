import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from './pedido.entity';
import { Producto } from '../../../Productos/Entities/producto.entity';

@Entity('DetallesPedido')
export class DetallePedido {
  @PrimaryGeneratedColumn()
  DetallePedidoId: number;

  @Column()
  PedidoId: number;

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

  @ManyToOne(() => Pedido, pedido => pedido.detalles)
  @JoinColumn({ name: 'PedidoId' })
  pedido: Pedido;


  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'ProductoId' })
  producto?: Producto;
}