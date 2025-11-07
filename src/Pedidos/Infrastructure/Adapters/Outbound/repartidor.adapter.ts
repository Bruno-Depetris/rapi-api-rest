import { Injectable, Inject } from '@nestjs/common';
import type { IRepartidorPort } from '../../Ports/Outbound/repartidor.port';
import { RepartidorRepository } from '../../../../Usuarios/Repositories/repartidor.repository';
import { UsuarioRepository } from '../../../../Usuarios/Repositories/usuario.repository';

@Injectable()
export class RepartidorAdapter implements IRepartidorPort {
  constructor(
    @Inject(RepartidorRepository) 
    private readonly repartidorRepository: RepartidorRepository,
    @Inject(UsuarioRepository)  
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async validarExiste(repartidorId: number): Promise<boolean> {
    const repartidor = await this.repartidorRepository.findById(repartidorId);
    return !!repartidor;
  }

  async obtenerPorUsuarioId(usuarioId: number) {
    const repartidor = await this.repartidorRepository.findByUsuarioId(usuarioId);
    if (!repartidor) {
      return null;
    }

    return {
      repartidorId: repartidor.RepartidorId,
      vehiculo: repartidor.Vehiculo || 'No especificado',
    };
  }

  async obtenerDireccionEntrega(usuarioId: number): Promise<string> {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    return usuario?.Direccion || 'Sin dirección';
  }
}