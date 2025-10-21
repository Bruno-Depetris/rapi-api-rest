import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { UsuarioRepository } from '../Repositories/usuario.repository';
import { VendedorRepository } from '../Repositories/vendedor.repository';
import { RepartidorRepository } from '../Repositories/repartidor.repository';
import { CambiarAVendedorDto } from '../DTOs/crearVendedor.dto';
import { CrearRepartidorDto } from '../DTOs/crearRepartidor.dto';
import { IUsuariosService } from '../Interfaces/usuariosService.interface';

@Injectable()
export class UsuariosService implements IUsuariosService{
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly vendedorRepository: VendedorRepository,
    private readonly repartidorRepository: RepartidorRepository,
  ) {}

  async obtenerPerfil(usuarioId: number) {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const perfil: any = {
      usuarioId: usuario.UsuarioId,
      nombre: usuario.Nombre,
      email: usuario.Email,
      rol: usuario.Rol,
      direccion: usuario.Direccion,
    };

    if (usuario.Rol === 'vendedor' && usuario.vendedor) {
      perfil.vendedor = {
        vendedorId: usuario.vendedor.VendedorId,
        negocioId: usuario.vendedor.NegocioId,
        telefono: usuario.vendedor.Telefono,
        horario: usuario.vendedor.Horario,
        comision: usuario.vendedor.Comision,
      };
    }

    if (usuario.Rol === 'repartidor' && usuario.repartidor) {
      perfil.repartidor = {
        repartidorId: usuario.repartidor.RepartidorId,
        vehiculo: usuario.repartidor.Vehiculo,
      };
    }

    return perfil;
  }

  async cambiarAVendedor(usuarioId: number, cambiarDto: CambiarAVendedorDto) {

    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.Rol !== 'cliente') {
      throw new BadRequestException('Solo los clientes pueden cambiar a vendedor');
    }

    const yaEsVendedor = await this.vendedorRepository.existsByUsuarioId(usuarioId);
    if (yaEsVendedor) {
      throw new ConflictException('Este usuario ya es vendedor');
    }

    // Crear registro de vendedor
    const nuevoVendedor = await this.vendedorRepository.create({
      UsuarioId: usuarioId,
      NegocioId: cambiarDto.CategoriaId,
      Direccion: cambiarDto.Direccion,
      Telefono: cambiarDto.Telefono ,
      Horario: cambiarDto.Horario ,
      Comision: cambiarDto.Comision,
    });

    // Actualizar rol del usuario
    await this.usuarioRepository.updateRol(usuarioId, 'vendedor');

    return {
      message: 'Usuario actualizado a vendedor exitosamente',
      vendedor: {
        vendedorId: nuevoVendedor.VendedorId,
        usuarioId: nuevoVendedor.UsuarioId,
        negocioId: nuevoVendedor.NegocioId,
      },
    };
  }

  // ========== CAMBIAR A REPARTIDOR ==========
  async cambiarARepartidor(usuarioId: number, crearDto: CrearRepartidorDto) {
    // Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que sea cliente
    if (usuario.Rol !== 'cliente') {
      throw new BadRequestException('Solo los clientes pueden cambiar a repartidor');
    }

    // Verificar que no sea ya repartidor
    const yaEsRepartidor = await this.repartidorRepository.existsByUsuarioId(usuarioId);
    if (yaEsRepartidor) {
      throw new ConflictException('Este usuario ya es repartidor');
    }

    // Crear registro de repartidor
    const nuevoRepartidor = await this.repartidorRepository.create({
      UsuarioId: usuarioId,
      Vehiculo: crearDto.Vehiculo,
    });

    // Actualizar rol del usuario
    await this.usuarioRepository.updateRol(usuarioId, 'repartidor');

    return {
      message: 'Usuario actualizado a repartidor exitosamente',
      repartidor: {
        repartidorId: nuevoRepartidor.RepartidorId,
        usuarioId: nuevoRepartidor.UsuarioId,
        vehiculo: nuevoRepartidor.Vehiculo,
      },
    };
  }

  // ========== LISTAR TODOS LOS USUARIOS (ADMIN) ==========
  async listarUsuarios(page: number = 1, limit: number = 10) {
    const usuarios = await this.usuarioRepository.findAll(page, limit);
    return usuarios.map((u) => ({
      usuarioId: u.UsuarioId,
      nombre: u.Nombre,
      email: u.Email,
      rol: u.Rol,
      direccion: u.Direccion,
    }));
  }

  // ========== ELIMINAR USUARIO (ADMIN) ==========
  async eliminarUsuario(usuarioId: number) {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si es vendedor, eliminar registro de vendedor
    if (usuario.Rol === 'vendedor' && usuario.vendedor) {
      await this.vendedorRepository.delete(usuario.vendedor.VendedorId);
    }

    // Si es repartidor, eliminar registro de repartidor
    if (usuario.Rol === 'repartidor' && usuario.repartidor) {
      await this.repartidorRepository.delete(usuario.repartidor.RepartidorId);
    }

    // Eliminar usuario
    await this.usuarioRepository.delete(usuarioId);

    return {
      message: 'Usuario eliminado exitosamente',
    };
  }
}