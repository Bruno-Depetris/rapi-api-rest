import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { UsuarioRepository } from '../Repositories/usuario.repository';
import { VendedorRepository } from '../Repositories/vendedor.repository';
import { RepartidorRepository } from '../Repositories/repartidor.repository';
import { NegocioRepository } from '../../Negocios/Repositories/negocio.repository';
import { CambiarAVendedorDto } from '../DTOs/crearVendedor.dto';
import { CrearRepartidorDto } from '../DTOs/crearRepartidor.dto';
import { IUsuariosService } from '../Interfaces/usuariosService.interface';

@Injectable()
export class UsuariosService implements IUsuariosService {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly vendedorRepository: VendedorRepository,
    private readonly repartidorRepository: RepartidorRepository,
    private readonly negocioRepository: NegocioRepository,
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

    if (usuario.vendedor) {
      perfil.vendedor = {
        vendedorId: usuario.vendedor.VendedorId,
        negocioId: usuario.vendedor.NegocioId,
        telefono: usuario.vendedor.Telefono,
        horario: usuario.vendedor.Horario,
        comision: usuario.vendedor.Comision,
        estado: usuario.vendedor.Estado, 
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
      throw new BadRequestException('Solo los clientes pueden solicitar ser vendedor');
    }

    const yaEsVendedor = await this.vendedorRepository.existsByUsuarioId(usuarioId);
    if (yaEsVendedor) {
      throw new ConflictException('Ya tienes una solicitud de vendedor');
    }

    const nuevoNegocio = await this.negocioRepository.create({
      NombreNegocio: cambiarDto.NombreNegocio,
      CategoriaId: cambiarDto.CategoriaId,
      Estado: 'Pendiente', 
    });

    const nuevoVendedor = await this.vendedorRepository.create({
      UsuarioId: usuarioId,
      NegocioId: nuevoNegocio.NegocioId,
      Direccion: cambiarDto.Direccion,
      Telefono: cambiarDto.Telefono,
      Horario: cambiarDto.Horario,
      Comision: cambiarDto.Comision,
      Estado: 'Pendiente', 
    });

    return {
      message: 'Solicitud de vendedor enviada. Espera la aprobación del administrador.',
      vendedor: {
        vendedorId: nuevoVendedor.VendedorId,
        usuarioId: nuevoVendedor.UsuarioId,
        negocioId: nuevoVendedor.NegocioId,
        estado: nuevoVendedor.Estado,
      },
      negocio: {
        negocioId: nuevoNegocio.NegocioId,
        nombreNegocio: nuevoNegocio.NombreNegocio,
        estado: nuevoNegocio.Estado,
      },
    };
  }

  async listarSolicitudesVendedor() {
    const vendedores = await this.vendedorRepository.findByEstado('Pendiente');

    return vendedores.map((v) => ({
      vendedorId: v.VendedorId,
      usuario: {
        usuarioId: v.usuario.UsuarioId,
        nombre: v.usuario.Nombre,
        email: v.usuario.Email,
      },
      negocio: v.negocio
        ? {
            negocioId: v.negocio.NegocioId,
            nombreNegocio: v.negocio.NombreNegocio,
          }
        : null,
      telefono: v.Telefono,
      direccion: v.Direccion,
      horario: v.Horario,
      comision: v.Comision,
      estado: v.Estado,
    }));
  }

  async aprobarVendedor(vendedorId: number) {
    const vendedor = await this.vendedorRepository.findById(vendedorId);
    if (!vendedor) {
      throw new NotFoundException('Vendedor no encontrado');
    }

    if (vendedor.Estado !== 'Pendiente') {
      throw new BadRequestException('Esta solicitud ya fue procesada');
    }

    // Aprobar vendedor
    await this.vendedorRepository.updateEstado(vendedorId, 'Aprobado');

    // Activar negocio
    if (vendedor.NegocioId) {
      await this.negocioRepository.updateEstado(vendedor.NegocioId, 'Activo');
    }

    // AHORA SÍ cambiar el rol del usuario
    await this.usuarioRepository.updateRol(vendedor.UsuarioId, 'vendedor');

    return {
      message: 'Vendedor aprobado exitosamente',
      vendedor: {
        vendedorId: vendedor.VendedorId,
        estado: 'Aprobado',
      },
    };
  }

  async rechazarVendedor(vendedorId: number, motivo?: string) {
    const vendedor = await this.vendedorRepository.findById(vendedorId);
    if (!vendedor) {
      throw new NotFoundException('Vendedor no encontrado');
    }

    if (vendedor.Estado !== 'Pendiente') {
      throw new BadRequestException('Esta solicitud ya fue procesada');
    }

    // Rechazar vendedor
    await this.vendedorRepository.updateEstado(vendedorId, 'Rechazado');

    // Rechazar negocio
    if (vendedor.NegocioId) {
      await this.negocioRepository.updateEstado(vendedor.NegocioId, 'Rechazado');
    }

    return {
      message: 'Solicitud de vendedor rechazada',
      motivo: motivo || 'No especificado',
    };
  }

  async cambiarARepartidor(usuarioId: number, crearDto: CrearRepartidorDto) {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.Rol !== 'cliente') {
      throw new BadRequestException('Solo los clientes pueden cambiar a repartidor');
    }

    const yaEsRepartidor = await this.repartidorRepository.existsByUsuarioId(usuarioId);
    if (yaEsRepartidor) {
      throw new ConflictException('Este usuario ya es repartidor');
    }

    const nuevoRepartidor = await this.repartidorRepository.create({
      UsuarioId: usuarioId,
      Vehiculo: crearDto.Vehiculo,
    });

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

  async eliminarUsuario(usuarioId: number) {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.Rol === 'vendedor' && usuario.vendedor) {
      await this.vendedorRepository.delete(usuario.vendedor.VendedorId);
    }

    if (usuario.Rol === 'repartidor' && usuario.repartidor) {
      await this.repartidorRepository.delete(usuario.repartidor.RepartidorId);
    }

    await this.usuarioRepository.delete(usuarioId);

    return {
      message: 'Usuario eliminado exitosamente',
    };
  }
}