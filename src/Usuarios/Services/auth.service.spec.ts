// src/Usuarios/Services/__tests__/auth.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../Services/auth.service';
import { UsuarioRepository } from '../Repositories/usuario.repository'
import { AdministradorRepository } from '../Repositories/admin.repository';
import { RegisterDto } from '../DTOs/register.dto';
import { LoginDto } from '../DTOs/login.dto';
import { LoginAdminDto } from '../DTOs/loginAdmin.dto';
import { Usuario } from '../Entities/usuario.entity';

// Mock de bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usuarioRepository: jest.Mocked<UsuarioRepository>;
  let adminRepository: jest.Mocked<AdministradorRepository>;
  let jwtService: jest.Mocked<JwtService>;

  // Mock data
const mockUsuario: Usuario = {
  UsuarioId: 1,
  Nombre: 'Juan Perez',
  Email: 'juan@email.com',
  Password: 'hashedPassword123',
  Direccion: 'Calle 123',
  Rol: 'cliente',
  vendedor: undefined,
  repartidor: undefined,
  favoritos: null,
};

const mockAdmin = {
  AdministradorID: 1,
  Usuario: 'admin',
  Password: 'hashedAdminPassword',
};

  beforeEach(async () => {
    const mockUsuarioRepository = {
      existsByEmail: jest.fn(),
      create: jest.fn(),
      findByEmail: jest.fn(),
    };

    const mockAdminRepository = {
      findByUsuario: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsuarioRepository,
          useValue: mockUsuarioRepository,
        },
        {
          provide: AdministradorRepository,
          useValue: mockAdminRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usuarioRepository = module.get(UsuarioRepository);
    adminRepository = module.get(AdministradorRepository);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      Nombre: 'Juan Perez',
      Email: 'juan@email.com',
      Password: 'password123',
      Direccion: 'Calle 123',
    };

    it('debería registrar un usuario exitosamente', async () => {
      usuarioRepository.existsByEmail.mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      usuarioRepository.create.mockResolvedValue(mockUsuario);

      const result = await service.register(registerDto);

      expect(usuarioRepository.existsByEmail).toHaveBeenCalledWith(registerDto.Email);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.Password, 10);
      expect(usuarioRepository.create).toHaveBeenCalledWith({
        Nombre: registerDto.Nombre,
        Email: registerDto.Email,
        Password: 'hashedPassword123',
        Direccion: registerDto.Direccion,
        Rol: 'cliente',
      });
      expect(result).toEqual({
        message: 'Usuario registrado exitosamente',
        user: {
          usuarioId: mockUsuario.UsuarioId,
          nombre: mockUsuario.Nombre,
          email: mockUsuario.Email,
          rol: mockUsuario.Rol,
          direccion: mockUsuario.Direccion,
        },
      });
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      usuarioRepository.existsByEmail.mockResolvedValue(true);

      await expect(service.register(registerDto)).rejects.toThrow(
        new ConflictException('El email ya está registrado'),
      );
      expect(usuarioRepository.existsByEmail).toHaveBeenCalledWith(registerDto.Email);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(usuarioRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      Email: 'juan@email.com',
      Password: 'password123',
    };

    it('debería hacer login exitosamente para un cliente', async () => {
      usuarioRepository.findByEmail.mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('mock.jwt.token');

      const result = await service.login(loginDto);

      expect(usuarioRepository.findByEmail).toHaveBeenCalledWith(loginDto.Email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.Password, mockUsuario.Password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUsuario.UsuarioId,
        email: mockUsuario.Email,
        rol: mockUsuario.Rol,
      });
      expect(result).toEqual({
        access_token: 'mock.jwt.token',
        user: {
          usuarioId: mockUsuario.UsuarioId,
          nombre: mockUsuario.Nombre,
          email: mockUsuario.Email,
          rol: mockUsuario.Rol,
          direccion: mockUsuario.Direccion,
        },
      });
    });

    it('debería incluir datos de vendedor si el usuario es vendedor', async () => {
      const mockVendedor = {
  ...mockUsuario,
  Rol: 'vendedor',
  vendedor: {
    VendedorId: 10,
    UsuarioId: 1,
    NegocioId: 5,
    Direccion: 'Calle negocio',
    Telefono: '123456789',
    Horario: '9am-10pm',
    Comision: 0.10,
    Estado: 'Aprobado',
    usuario: undefined as any,
    negocio: undefined,
  },
  repartidor: undefined,
  favoritos: null,
};

      usuarioRepository.findByEmail.mockResolvedValue(mockVendedor);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('mock.jwt.token');

      const result = await service.login(loginDto);

      expect(result.user).toMatchObject({
        usuarioId: mockVendedor.UsuarioId,
        rol: 'vendedor',
        vendedorId: 10,
        negocioId: 5,
        telefono: '123456789',
        horario: '9am-10pm',
      });
    });

    it('debería lanzar UnauthorizedException si el email no existe', async () => {
      usuarioRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Credenciales inválidas'),
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('debería lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      usuarioRepository.findByEmail.mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Credenciales inválidas'),
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('loginAdmin', () => {
    const loginAdminDto: LoginAdminDto = {
      Usuario: 'admin',
      Password: 'adminPassword',
    };

    it('debería hacer login de admin exitosamente', async () => {
      adminRepository.findByUsuario.mockResolvedValue(mockAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('mock.admin.token');

      const result = await service.loginAdmin(loginAdminDto);

      expect(adminRepository.findByUsuario).toHaveBeenCalledWith(loginAdminDto.Usuario);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginAdminDto.Password, mockAdmin.Password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockAdmin.AdministradorID,
        email: mockAdmin.Usuario,
        rol: 'admin',
      });
      expect(result).toEqual({
        access_token: 'mock.admin.token',
        admin: {
          adminId: mockAdmin.AdministradorID,
          usuario: mockAdmin.Usuario,
        },
      });
    });

    it('debería lanzar UnauthorizedException si el admin no existe', async () => {
      adminRepository.findByUsuario.mockResolvedValue(null);

      await expect(service.loginAdmin(loginAdminDto)).rejects.toThrow(
        new UnauthorizedException('Credenciales de administrador inválidas'),
      );
    });
  });

  describe('validateToken', () => {
    it('debería validar un token correctamente', async () => {
      const token = 'valid.jwt.token';
      const payload = { sub: 1, email: 'juan@email.com', rol: 'cliente' };
      jwtService.verify.mockReturnValue(payload);

      const result = await service.validateToken(token);

      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        valid: true,
        payload,
      });
    });

    it('debería lanzar UnauthorizedException para token inválido', async () => {
      const token = 'invalid.jwt.token';
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken(token)).rejects.toThrow(
        new UnauthorizedException('Token inválido o expirado'),
      );
    });
  });
});
