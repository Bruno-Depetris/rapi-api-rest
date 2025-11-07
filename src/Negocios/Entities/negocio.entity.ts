import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Categoria } from './categoria.entity';

@Entity('Negocios')
export class Negocio {
  @PrimaryGeneratedColumn()
  NegocioId: number;

  @Column({ nullable: true })
  CategoriaId: number;

  @Column({ type: 'varchar', length: 150 })
  NombreNegocio: string;

    @Column({ 
    type: 'enum', 
    enum: ['Pendiente', 'Activo', 'Rechazado'],
    default: 'Pendiente'
  })
  Estado: string;

  @ManyToOne(() => Categoria, { nullable: true })
  @JoinColumn({ name: 'CategoriaId' })
  categoria?: Categoria;
}