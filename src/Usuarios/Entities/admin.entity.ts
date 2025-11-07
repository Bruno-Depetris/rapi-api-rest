import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ADMINISTRADOR')
export class Administrador {
  @PrimaryGeneratedColumn()
  AdministradorID: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  Usuario: string;

  @Column({ type: 'varchar', length: 255 })
  Password: string;
}