import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('CategoriasProductos')
export class CategoriaProducto {
  @PrimaryGeneratedColumn()
  CategoriaProductoId: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  Nombre: string;
}