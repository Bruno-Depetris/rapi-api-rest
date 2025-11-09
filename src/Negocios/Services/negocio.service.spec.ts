import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { NegociosService } from './negocio.service';
import { NegocioRepository } from '../Repositories/negocio.repository';
import { VendedorRepository } from '../../Usuarios/Repositories/vendedor.repository';
import { ActualizarNegocioDto } from '../DTOs/actualizarnegocio.dto';

describe('NegociosService', () => {
    let service: NegociosService;
    let negocioRepository: jest.Mocked<NegocioRepository>;
    let vendedorRepository: jest.Mocked<VendedorRepository>;

    const mockNegocio = {
        NegocioId: 1,
        NombreNegocio: 'Pizzería Don Juan',
        CategoriaId: 1,
        Estado: 'Activo',
        categoria: {
            CategoriaId: 1,
            Categoria: 'Restaurantes',
        },
    };

    const mockVendedor = {
        VendedorId: 10,
        UsuarioId: 5,
        NegocioId: 1,
        Telefono: '123456789',
        Horario: '9am-10pm',
        Direccion: 'Calle 123',
    };

    beforeEach(async () => {
        const mockNegocioRepo = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByNombre: jest.fn(),
            findByCategoria: jest.fn(),
            search: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        };

        const mockVendedorRepo = {
            findByUsuarioId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NegociosService,
                { provide: NegocioRepository, useValue: mockNegocioRepo },
                { provide: VendedorRepository, useValue: mockVendedorRepo },
            ],
        }).compile();

        service = module.get<NegociosService>(NegociosService);
        negocioRepository = module.get(NegocioRepository);
        vendedorRepository = module.get(VendedorRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('listarNegocios', () => {
        it('debería listar negocios con paginación', async () => {
            // Arrange
            const negocios = [mockNegocio, { ...mockNegocio, NegocioId: 2 }];
            negocioRepository.findAll.mockResolvedValue(negocios as any);
            negocioRepository.count.mockResolvedValue(2);

            // Act
            const result = await service.listarNegocios(1, 10);

            // Assert
            expect(negocioRepository.findAll).toHaveBeenCalledWith(1, 10);
            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(result.totalPages).toBe(1);
        });
    });

    describe('buscarNegocios', () => {
        it('debería buscar negocios por término', async () => {
            // Arrange
            negocioRepository.search.mockResolvedValue([mockNegocio] as any);

            // Act
            const result = await service.buscarNegocios('pizza', 1, 10);

            // Assert
            expect(negocioRepository.search).toHaveBeenCalledWith('pizza', 1, 10);
            expect(result.data).toHaveLength(1);
            expect(result.termino).toBe('pizza');
        });
    });

    describe('obtenerNegocio', () => {
        it('debería obtener un negocio por ID', async () => {
            // Arrange
            negocioRepository.findById.mockResolvedValue(mockNegocio as any);

            // Act
            const result = await service.obtenerNegocio(1);

            // Assert
            expect(negocioRepository.findById).toHaveBeenCalledWith(1);
            expect(result.negocioId).toBe(1);
            expect(result.nombreNegocio).toBe('Pizzería Don Juan');
        });

        it('debería lanzar NotFoundException si no existe', async () => {
            // Arrange
            negocioRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(service.obtenerNegocio(999)).rejects.toThrow(
                new NotFoundException('Negocio no encontrado'),
            );
        });
    });

    describe('obtenerMiNegocio', () => {
        it('debería obtener el negocio del vendedor', async () => {
            // Arrange
            vendedorRepository.findByUsuarioId.mockResolvedValue(mockVendedor as any);
            negocioRepository.findById.mockResolvedValue(mockNegocio as any);

            // Act
            const result = await service.obtenerMiNegocio(5);

            // Assert
            expect(vendedorRepository.findByUsuarioId).toHaveBeenCalledWith(5);
            expect(negocioRepository.findById).toHaveBeenCalledWith(1);
            expect(result.negocioId).toBe(1);
            expect(result.vendedor.vendedorId).toBe(10);
        });

        it('debería lanzar NotFoundException si no es vendedor', async () => {
            // Arrange
            vendedorRepository.findByUsuarioId.mockResolvedValue(null);

            // Act & Assert
            await expect(service.obtenerMiNegocio(5)).rejects.toThrow(
                new NotFoundException('No eres vendedor'),
            );
        });

        it('debería lanzar NotFoundException si no tiene negocio asignado', async () => {
            // Arrange
            vendedorRepository.findByUsuarioId.mockResolvedValue({
                ...mockVendedor,
                NegocioId: null,
            } as any);

            // Act & Assert
            await expect(service.obtenerMiNegocio(5)).rejects.toThrow(
                new NotFoundException('No tienes un negocio asignado'),
            );
        });
    });

    describe('actualizarNegocio', () => {
        const dto: ActualizarNegocioDto = {
            NombreNegocio: 'Pizzería Don Juan - Sucursal 2',
        };

        it('debería actualizar negocio como admin', async () => {
            // Arrange
            const negocioActualizado = { ...mockNegocio, NombreNegocio: dto.NombreNegocio };
            negocioRepository.findById.mockResolvedValue(mockNegocio as any);
            negocioRepository.findByNombre.mockResolvedValue(null);
            negocioRepository.update.mockResolvedValue(negocioActualizado as any);

            // Act
            const result = await service.actualizarNegocio(1, 999, 'admin', dto);

            // Assert
            expect(negocioRepository.update).toHaveBeenCalledWith(1, dto);
            expect(result.message).toBe('Negocio actualizado exitosamente');
        });

        it('debería actualizar negocio como vendedor propietario', async () => {
            // Arrange
            const negocioActualizado = { ...mockNegocio, NombreNegocio: dto.NombreNegocio };
            negocioRepository.findById.mockResolvedValue(mockNegocio as any);
            vendedorRepository.findByUsuarioId.mockResolvedValue(mockVendedor as any);
            negocioRepository.findByNombre.mockResolvedValue(null);
            negocioRepository.update.mockResolvedValue(negocioActualizado as any);

            // Act
            const result = await service.actualizarNegocio(1, 5, 'vendedor', dto);

            // Assert
            expect(vendedorRepository.findByUsuarioId).toHaveBeenCalledWith(5);
            expect(negocioRepository.update).toHaveBeenCalledWith(1, dto);
        });

        it('debería lanzar ForbiddenException si vendedor no es propietario', async () => {
            // Arrange
            negocioRepository.findById.mockResolvedValue(mockNegocio as any);
            vendedorRepository.findByUsuarioId.mockResolvedValue({
                ...mockVendedor,
                NegocioId: 999,
            } as any);

            // Act & Assert
            await expect(service.actualizarNegocio(1, 5, 'vendedor', dto)).rejects.toThrow(
                new ForbiddenException('No tienes permiso para actualizar este negocio'),
            );
        });

        it('debería lanzar ConflictException si nombre ya existe', async () => {
            // Arrange
            const otroNegocio = { NegocioId: 2, NombreNegocio: dto.NombreNegocio };
            negocioRepository.findById.mockResolvedValue(mockNegocio as any);
            negocioRepository.findByNombre.mockResolvedValue(otroNegocio as any);

            // Act & Assert
            await expect(service.actualizarNegocio(1, 999, 'admin', dto)).rejects.toThrow(
                new ConflictException('Ya existe un negocio con ese nombre'),
            );
        });
    });

    describe('eliminarNegocio', () => {
        it('debería eliminar negocio como admin', async () => {
            // Arrange
            negocioRepository.findById.mockResolvedValue(mockNegocio as any);

            // Act
            const result = await service.eliminarNegocio(1, 999, 'admin');

            // Assert
            expect(negocioRepository.delete).toHaveBeenCalledWith(1);
            expect(result.message).toBe('Negocio eliminado exitosamente');
        });

        it('debería lanzar ForbiddenException si vendedor no es propietario', async () => {
            // Arrange
            negocioRepository.findById.mockResolvedValue(mockNegocio as any);
            vendedorRepository.findByUsuarioId.mockResolvedValue({
                ...mockVendedor,
                NegocioId: 999,
            } as any);

            // Act & Assert
            await expect(service.eliminarNegocio(1, 5, 'vendedor')).rejects.toThrow(
                new ForbiddenException('No tienes permiso para eliminar este negocio'),
            );
        });
    });

    describe('listarPorCategoria', () => {
        it('debería listar negocios por categoría', async () => {
            // Arrange
            negocioRepository.findByCategoria.mockResolvedValue([mockNegocio] as any);

            // Act
            const result = await service.listarPorCategoria(1);

            // Assert
            expect(negocioRepository.findByCategoria).toHaveBeenCalledWith(1);
            expect(result).toHaveLength(1);
            expect(result[0].categoriaId).toBe(1);
        });
    });
});