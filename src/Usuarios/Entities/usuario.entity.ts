import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm';
import { Vendedor } from './vendedor.entity';
import { Repartidor } from './repartidor.entity';
import { Favoritos } from '../../Productos/Entities/favoritos.entity';

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

  @OneToOne(() => Vendedor, (vendedor) => vendedor.usuario, { nullable: true })
  vendedor?: Vendedor;

  @OneToOne(() => Repartidor, (repartidor) => repartidor.usuario, { nullable: true })
  repartidor?: Repartidor;

  @OneToMany(() => Favoritos, (favoritos) => favoritos.usuario)
  favoritos: Favoritos[];
}