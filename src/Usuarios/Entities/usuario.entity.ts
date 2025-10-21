import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Vendedor } from './vendedor.entity';
import { Repartidor } from './repartidor.entity';

@Entity('Usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  UsuarioId: number;

  @Column({ type: 'varchar', length: 100 })
  Nombre: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  Email: string;

  @Column({ type: 'varchar', length: 255 })
  Password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  Direccion: string;

  @Column({ 
    type: 'enum', 
    enum: ['cliente', 'vendedor', 'repartidor'],
    default: 'cliente'
  })
  Rol: string;

  // Relaciones
  @OneToOne(() => Vendedor, (vendedor) => vendedor.usuario, { nullable: true })
  vendedor?: Vendedor;

  @OneToOne(() => Repartidor, (repartidor) => repartidor.usuario, { nullable: true })
  repartidor?: Repartidor;
}