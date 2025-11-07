import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from '../Services/usuarios.service';
import { UsuarioRepository } from '../Repositories/usuario.repository';
import { VendedorRepository } from '../Repositories/vendedor.repository';
import { RepartidorRepository } from '../Repositories/repartidor.repository';
import { NegocioRepository } from '../../Negocios/Repositories/negocio.repository';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('UsuariosService', () => {
  let service: UsuariosService;

  const mockUsuarioRepo = {
    findById: jest.fn(),
    findAll: jest.fn(),
    updateRol: jest.fn(),
    delete: jest.fn(),
  };

  const mockVendedorRepo = {
    existsByUsuarioId: jest.fn(),
    findByEstado: jest.fn(),
    findById: jest.fn(),
    updateEstado: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  };

  const mockRepartidorRepo = {
    existsByUsuarioId: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  const mockNegocioRepo = {
    create: jest.fn(),
    updateEstado: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: UsuarioRepository, useValue: mockUsuarioRepo },
        { provide: VendedorRepository, useValue: mockVendedorRepo },
        { provide: RepartidorRepository, useValue: mockRepartidorRepo },
        { provide: NegocioRepository, useValue: mockNegocioRepo },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);

    jest.clearAllMocks();
  });

  // -----------------------------------------------
  // OBTENER PERFIL
  // -----------------------------------------------
  it('debería retornar el perfil del usuario', async () => {
    mockUsuarioRepo.findById.mockResolvedValue({
      UsuarioId: 1,
      Nombre: 'Juan',
      Email: 'test@mail.com',
      Rol: 'cliente',
      Direccion: 'Calle 123',
    });

    const result = await service.obtenerPerfil(1);
    expect(result.nombre).toBe('Juan');
    expect(mockUsuarioRepo.findById).toHaveBeenCalled();
  });

  it('debería tirar error si usuario no existe', async () => {
    mockUsuarioRepo.findById.mockResolvedValue(null);

    await expect(service.obtenerPerfil(1)).rejects.toThrow(NotFoundException);
  });

  // -----------------------------------------------
  // CAMBIAR A VENDEDOR
  // -----------------------------------------------
  it('debería crear solicitud de vendedor', async () => {
    mockUsuarioRepo.findById.mockResolvedValue({ UsuarioId: 1, Rol: 'cliente' });
    mockVendedorRepo.existsByUsuarioId.mockResolvedValue(false);
    mockNegocioRepo.create.mockResolvedValue({ NegocioId: 10, NombreNegocio: 'Shop', Estado: 'Pendiente' });
    mockVendedorRepo.create.mockResolvedValue({ VendedorId: 20, UsuarioId: 1, NegocioId: 10, Estado: 'Pendiente' });

    const dto = { NombreNegocio: 'Shop', CategoriaId: 1, Direccion: 'Calle', Telefono: '123', Horario: '9-18', Comision: 10 };

    const result = await service.cambiarAVendedor(1, dto);

    expect(result.vendedor.vendedorId).toBe(20);
  });

  it('no debería permitir cambiar si no es cliente', async () => {
    mockUsuarioRepo.findById.mockResolvedValue({ UsuarioId: 1, Rol: 'vendedor' });

    await expect(service.cambiarAVendedor(1, {} as any)).rejects.toThrow(BadRequestException);
  });

  it('no debería permitir si ya tiene solicitud de vendedor', async () => {
    mockUsuarioRepo.findById.mockResolvedValue({ UsuarioId: 1, Rol: 'cliente' });
    mockVendedorRepo.existsByUsuarioId.mockResolvedValue(true);

    await expect(service.cambiarAVendedor(1, {} as any)).rejects.toThrow(ConflictException);
  });

  // -----------------------------------------------
  // LISTAR SOLICITUDES
  // -----------------------------------------------
  it('debería listar solicitudes de vendedor', async () => {
    mockVendedorRepo.findByEstado.mockResolvedValue([
      {
        VendedorId: 1,
        usuario: { UsuarioId: 2, Nombre: 'Juan', Email: 'test@mail.com' },
        negocio: { NegocioId: 3, NombreNegocio: 'Loca' },
        Telefono: '123',
        Direccion: 'Calle',
        Horario: '9-18',
        Comision: 10,
        Estado: 'Pendiente',
      },
    ]);

    const result = await service.listarSolicitudesVendedor();
    expect(result.length).toBe(1);
  });

  // -----------------------------------------------
  // APROBAR VENDEDOR
  // -----------------------------------------------
  it('debería aprobar vendedor', async () => {
    mockVendedorRepo.findById.mockResolvedValue({
      VendedorId: 1,
      UsuarioId: 2,
      Estado: 'Pendiente',
      NegocioId: 3,
    });

    await service.aprobarVendedor(1);

    expect(mockVendedorRepo.updateEstado).toHaveBeenCalledWith(1, 'Aprobado');
    expect(mockNegocioRepo.updateEstado).toHaveBeenCalledWith(3, 'Activo');
    expect(mockUsuarioRepo.updateRol).toHaveBeenCalledWith(2, 'vendedor');
  });

  // -----------------------------------------------
  // RECHAZAR VENDEDOR
  // -----------------------------------------------
  it('debería rechazar vendedor', async () => {
    mockVendedorRepo.findById.mockResolvedValue({
      VendedorId: 1,
      Estado: 'Pendiente',
      NegocioId: 3,
    });

    const result = await service.rechazarVendedor(1, 'Motivo');

    expect(result.motivo).toBe('Motivo');
    expect(mockVendedorRepo.updateEstado).toHaveBeenCalledWith(1, 'Rechazado');
  });

  // -----------------------------------------------
  // CAMBIAR A REPARTIDOR
  // -----------------------------------------------
  it('debería cambiar a repartidor', async () => {
    mockUsuarioRepo.findById.mockResolvedValue({ UsuarioId: 1, Rol: 'cliente' });
    mockRepartidorRepo.existsByUsuarioId.mockResolvedValue(false);
    mockRepartidorRepo.create.mockResolvedValue({ RepartidorId: 10, UsuarioId: 1, Vehiculo: 'Moto' });

    const result = await service.cambiarARepartidor(1, { Vehiculo: 'Moto' });

    expect(result.repartidor.repartidorId).toBe(10);
    expect(mockUsuarioRepo.updateRol).toHaveBeenCalledWith(1, 'repartidor');
  });

  // -----------------------------------------------
  // ELIMINAR USUARIO
  // -----------------------------------------------
  it('debería eliminar usuario', async () => {
    mockUsuarioRepo.findById.mockResolvedValue({ UsuarioId: 1, Rol: 'cliente' });

    const result = await service.eliminarUsuario(1);

    expect(result.message).toBe('Usuario eliminado exitosamente');
    expect(mockUsuarioRepo.delete).toHaveBeenCalledWith(1);
  });
});
