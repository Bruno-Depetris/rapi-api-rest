import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Negocio } from '../../Negocios/Entities/negocio.entity'; 

@Entity('Vendedor')
export class Vendedor {
  @PrimaryGeneratedColumn()
  VendedorId: number;

  @Column({ unique: true })
  UsuarioId: number;

  @Column({ nullable: true })
  NegocioId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  Direccion: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  Telefono: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  Horario: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  Comision: number;

  @Column({ 
    type: 'enum', 
    enum: ['Pendiente', 'Aprobado', 'Rechazado'],
    default: 'Pendiente'
  })
  Estado: string;

  @OneToOne(() => Usuario, (usuario) => usuario.vendedor)
  @JoinColumn({ name: 'UsuarioId' })
  usuario: Usuario;

  @ManyToOne(() => Negocio, { nullable: true })
  @JoinColumn({ name: 'NegocioId' })
  negocio?: Negocio;
}