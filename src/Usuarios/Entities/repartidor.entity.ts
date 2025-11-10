import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('Repartidor')
export class Repartidor {
  @PrimaryGeneratedColumn()
  RepartidorId: number;

  @Column({ unique: true })
  UsuarioId: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  Vehiculo: string;

  @OneToOne(() => Usuario, (usuario) => usuario.repartidor)
  @JoinColumn({ name: 'UsuarioId' })
  usuario: Usuario;
}
