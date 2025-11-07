import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('MetodoPago')
export class MetodoPago {
  @PrimaryGeneratedColumn()
  MetodoId: number; 

  @Column({ type: 'varchar', length: 100 })
  Metodo: string; 

  @Column({ type: 'bit', default: 0 })
  IsDeleted: boolean;
}