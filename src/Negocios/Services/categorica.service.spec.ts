import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CategoriasService } from './categoria.service';
import { CategoriaRepository } from '../Repositories/categoria.repository';
import { CrearCategoriaDto } from '../DTOs/crearcategoria.dto';
import { ActualizarCategoriaDto } from '../DTOs/actualizarcategoria.dto';

describe('CategoriasService', () => {
    let service: CategoriasService;
    let categoriaRepository: jest.Mocked<CategoriaRepository>;

    const mockCategoria = {
        CategoriaId: 1,
        Categoria: 'Restaurantes',
    };

    beforeEach(async () => {
        const mockCategoriaRepo = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByNombre: jest.fn(),
            existsByNombre: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategoriasService,
                { provide: CategoriaRepository, useValue: mockCategoriaRepo },
            ],
        }).compile();

        service = module.get<CategoriasService>(CategoriasService);
        categoriaRepository = module.get(CategoriaRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('listarCategorias', () => {
        it('debería listar todas las categorías', async () => {
            // Arrange
            const categorias = [
                { CategoriaId: 1, Categoria: 'Restaurantes' },
                { CategoriaId: 2, Categoria: 'Supermercados' },
                { CategoriaId: 3, Categoria: 'Farmacias' },
            ];
            categoriaRepository.findAll.mockResolvedValue(categorias as any);

            // Act
            const result = await service.listarCategorias();

            // Assert
            expect(categoriaRepository.findAll).toHaveBeenCalled();
            expect(result).toHaveLength(3);
            expect(result[0]).toEqual({
                categoriaId: 1,
                nombre: 'Restaurantes',
            });
        });
    });

    describe('obtenerCategoria', () => {
        it('debería obtener una categoría por ID', async () => {
            // Arrange
            categoriaRepository.findById.mockResolvedValue(mockCategoria as any);

            // Act
            const result = await service.obtenerCategoria(1);

            // Assert
            expect(categoriaRepository.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual({
                categoriaId: 1,
                nombre: 'Restaurantes',
            });
        });

        it('debería lanzar NotFoundException si no existe', async () => {
            // Arrange
            categoriaRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(service.obtenerCategoria(999)).rejects.toThrow(
                new NotFoundException('Categoría no encontrada'),
            );
        });
    });

    describe('crearCategoria', () => {
        const dto: CrearCategoriaDto = {
            Categoria: 'Restaurantes',
        };

        it('debería crear una categoría exitosamente', async () => {
            // Arrange
            categoriaRepository.existsByNombre.mockResolvedValue(false);
            categoriaRepository.create.mockResolvedValue(mockCategoria as any);

            // Act
            const result = await service.crearCategoria(dto);

            // Assert
            expect(categoriaRepository.existsByNombre).toHaveBeenCalledWith('Restaurantes');
            expect(categoriaRepository.create).toHaveBeenCalledWith(dto);
            expect(result.message).toBe('Categoría creada exitosamente');
            expect(result.categoria.categoriaId).toBe(1);
        });

        it('debería lanzar ConflictException si ya existe', async () => {
            // Arrange
            categoriaRepository.existsByNombre.mockResolvedValue(true);

            // Act & Assert
            await expect(service.crearCategoria(dto)).rejects.toThrow(
                new ConflictException('Ya existe una categoría con ese nombre'),
            );
            expect(categoriaRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('actualizarCategoria', () => {
        const dto: ActualizarCategoriaDto = {
            Categoria: 'Restaurantes Modificado',
        };

        it('debería actualizar una categoría exitosamente', async () => {
            // Arrange
            const categoriaActualizada = { ...mockCategoria, Categoria: 'Restaurantes Modificado' };
            categoriaRepository.findById.mockResolvedValue(mockCategoria as any);
            categoriaRepository.findByNombre.mockResolvedValue(null);
            categoriaRepository.update.mockResolvedValue(categoriaActualizada as any);

            // Act
            const result = await service.actualizarCategoria(1, dto);

            // Assert
            expect(categoriaRepository.findById).toHaveBeenCalledWith(1);
            expect(categoriaRepository.findByNombre).toHaveBeenCalledWith('Restaurantes Modificado');
            expect(categoriaRepository.update).toHaveBeenCalledWith(1, dto);
            expect(result.message).toBe('Categoría actualizada exitosamente');
        });

        it('debería lanzar NotFoundException si no existe', async () => {
            // Arrange
            categoriaRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(service.actualizarCategoria(999, dto)).rejects.toThrow(
                new NotFoundException('Categoría no encontrada'),
            );
        });

        it('debería lanzar ConflictException si nuevo nombre ya existe', async () => {
            // Arrange
            const otraCategoria = { CategoriaId: 2, Categoria: 'Restaurantes Modificado' };
            categoriaRepository.findById.mockResolvedValue(mockCategoria as any);
            categoriaRepository.findByNombre.mockResolvedValue(otraCategoria as any);

            // Act & Assert
            await expect(service.actualizarCategoria(1, dto)).rejects.toThrow(
                new ConflictException('Ya existe una categoría con ese nombre'),
            );
        });
    });

    describe('eliminarCategoria', () => {
        it('debería eliminar una categoría exitosamente', async () => {
            // Arrange
            categoriaRepository.findById.mockResolvedValue(mockCategoria as any);

            // Act
            const result = await service.eliminarCategoria(1);

            // Assert
            expect(categoriaRepository.findById).toHaveBeenCalledWith(1);
            expect(categoriaRepository.delete).toHaveBeenCalledWith(1);
            expect(result.message).toBe('Categoría eliminada exitosamente');
        });

        it('debería lanzar NotFoundException si no existe', async () => {
            // Arrange
            categoriaRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(service.eliminarCategoria(999)).rejects.toThrow(
                new NotFoundException('Categoría no encontrada'),
            );
            expect(categoriaRepository.delete).not.toHaveBeenCalled();
        });
    });
});