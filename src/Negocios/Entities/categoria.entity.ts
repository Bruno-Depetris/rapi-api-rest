import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Categorias')
export class Categoria {
  @PrimaryGeneratedColumn()
  CategoriaId: number;

  @Column({ type: 'varchar', length: 100 })
  Categoria: string;
}