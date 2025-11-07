import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Usuario } from "../../Usuarios/Entities/usuario.entity";
import { Producto } from "./producto.entity";

@Entity('Favoritos')
export class Favoritos {
  @PrimaryGeneratedColumn()
  FavoritoId: number;

  @Column({ type: 'int' })
  UsuarioId: number;

  @Column({ type: 'int' })
  ProductoId: number;

  @ManyToOne(() => Usuario, usuario => usuario.favoritos)
  @JoinColumn({ name: 'UsuarioId' })
  usuario: Usuario;

  @ManyToOne(() => Producto, producto => producto.favoritos)
  @JoinColumn({ name: 'ProductoId' })
  producto: Producto;
}