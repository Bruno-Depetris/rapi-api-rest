import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IUsuarioPort } from '../../Ports/Outbound/usuario.port';
import { UsuarioRepository } from '../../../../Usuarios/Repositories/usuario.repository';

@Injectable()
export class UsuarioAdapter implements IUsuarioPort {
    constructor(
    @Inject(UsuarioRepository)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async validarExiste(usuarioId: number): Promise<boolean> {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    return !!usuario;
  }

  async obtenerDatos(usuarioId: number) {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      usuarioId: usuario.UsuarioId,
      nombre: usuario.Nombre,
      direccion: usuario.Direccion || 'Sin dirección',
    };
  }
}