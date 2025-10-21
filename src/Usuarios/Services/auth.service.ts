import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioRepository } from '../Repositories/usuario.repository';
import { AdministradorRepository } from '../Repositories/admin.repository';
import { RegisterDto } from '../DTOs/register.dto';
import { LoginDto } from '../DTOs/login.dto';
import { LoginAdminDto } from '../DTOs/loginAdmin.dto';
import { IAuthService } from '../Interfaces/authService.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly adminRepository: AdministradorRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {

    const emailExiste = await this.usuarioRepository.existsByEmail(registerDto.Email);
    if (emailExiste) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.Password, 10);

    const nuevoUsuario = await this.usuarioRepository.create({
      Nombre: registerDto.Nombre,
      Email: registerDto.Email,
      Password: hashedPassword,
      Direccion: registerDto.Direccion,
      Rol: 'cliente',
    });


    const payload = {
      sub: nuevoUsuario.UsuarioId,
      email: nuevoUsuario.Email,
      rol: nuevoUsuario.Rol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        usuarioId: nuevoUsuario.UsuarioId,
        nombre: nuevoUsuario.Nombre,
        email: nuevoUsuario.Email,
        rol: nuevoUsuario.Rol,
        direccion: nuevoUsuario.Direccion,
      },
    };
  }


  async login(loginDto: LoginDto) {

    const usuario = await this.usuarioRepository.findByEmail(loginDto.Email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(loginDto.Password, usuario.Password);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: usuario.UsuarioId,
      email: usuario.Email,
      rol: usuario.Rol,
    };

    let datosAdicionales = {};

    if (usuario.Rol === 'vendedor' && usuario.vendedor) {
      datosAdicionales = {
        vendedorId: usuario.vendedor.VendedorId,
        negocioId: usuario.vendedor.NegocioId,
        telefono: usuario.vendedor.Telefono,
        horario: usuario.vendedor.Horario,
      };
    }

    if (usuario.Rol === 'repartidor' && usuario.repartidor) {
      datosAdicionales = {
        repartidorId: usuario.repartidor.RepartidorId,
        vehiculo: usuario.repartidor.Vehiculo,
      };
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        usuarioId: usuario.UsuarioId,
        nombre: usuario.Nombre,
        email: usuario.Email,
        rol: usuario.Rol,
        direccion: usuario.Direccion,
        ...datosAdicionales,
      },
    };
  }

  async loginAdmin(loginAdminDto: LoginAdminDto) {
    // Buscar admin por usuario
    const admin = await this.adminRepository.findByUsuario(loginAdminDto.Usuario);
    if (!admin) {
      throw new UnauthorizedException('Credenciales de administrador inválidas');
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(loginAdminDto.Password, admin.Password);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales de administrador inválidas');
    }

    // Generar JWT (con rol especial 'admin')
    const payload = {
      sub: admin.AdministradorID,
      email: admin.Usuario, // Usamos el username como email
      rol: 'admin',
    };

    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        adminId: admin.AdministradorID,
        usuario: admin.Usuario,
      },
    };
  }
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return {
        valid: true,
        payload,
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}