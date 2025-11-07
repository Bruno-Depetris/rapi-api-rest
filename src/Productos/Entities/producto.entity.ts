import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Vendedor } from '../../Usuarios/Entities/vendedor.entity';
import { CategoriaProducto } from './categoriaproducto.entity';
import { Favoritos } from './favoritos.entity';

@Entity('Productos')
export class Producto {
  @PrimaryGeneratedColumn()
  ProductoId: number;

  @Column()
  VendedorId: number;

  @Column({ nullable: true })
  CategoriaProductoId: number;

  @Column({ type: 'varchar', length: 100 })
  Nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  Precio: number;

  @Column({ type: 'text', nullable: true })
  Descripcion: string;

  @Column({ type: 'int', default: 1 })
  Disponibilidad: number;

  @Column({ type: 'json', nullable: true })
  Imagenes: string[];

  @Column({ type: 'tinyint', default: 0 })
  IsDeleted: number;

  @ManyToOne(() => Vendedor)
  @JoinColumn({ name: 'VendedorId' })
  vendedor: Vendedor;

  @OneToMany(() => Favoritos, favoritos => favoritos.producto)
  favoritos: Favoritos[];

  @ManyToOne(() => CategoriaProducto, { nullable: true })
  @JoinColumn({ name: 'CategoriaProductoId' })
  categoriaProducto?: CategoriaProducto;
}
