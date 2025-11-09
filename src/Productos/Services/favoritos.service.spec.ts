import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { FavoritosService } from './favoritos.service';
import { FavoritosRepository } from '../Repositories/favoritos.repository';
import { Favoritos } from '../Entities/favoritos.entity';

describe('FavoritosService', () => {
    let service: FavoritosService;
    let repository: jest.Mocked<FavoritosRepository>;

    const mockFavorito: Favoritos = {
        FavoritoId: 1,
        UsuarioId: 5,
        ProductoId: 10,
    } as Favoritos;

    beforeEach(async () => {
        const mockRepo = {
            findAllByUsuarioId: jest.fn(),
            create: jest.fn(),
            removeByUsuarioYProducto: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FavoritosService,
                { provide: FavoritosRepository, useValue: mockRepo },
            ],
        }).compile();

        service = module.get<FavoritosService>(FavoritosService);
        repository = module.get(FavoritosRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('agregarFavorito', () => {
        const dto = {
            UsuarioId: 5,
            ProductoId: 10,
        };

        it('debería agregar un favorito exitosamente', async () => {
            // Arrange
            repository.findAllByUsuarioId.mockResolvedValue([]);
            repository.create.mockResolvedValue(mockFavorito);

            // Act
            const result = await service.agregarFavorito(dto);

            // Assert
            expect(repository.findAllByUsuarioId).toHaveBeenCalledWith(5);
            expect(repository.create).toHaveBeenCalledWith({
                UsuarioId: 5,
                ProductoId: 10,
            });
            expect(result.ProductoId).toBe(10);
        });

        it('debería lanzar ConflictException si ya existe', async () => {
            // Arrange
            repository.findAllByUsuarioId.mockResolvedValue([mockFavorito]);

            // Act & Assert
            await expect(service.agregarFavorito(dto)).rejects.toThrow(
                new ConflictException('El producto ya está en favoritos'),
            );
            expect(repository.create).not.toHaveBeenCalled();
        });

        it('debería lanzar NotFoundException si no hay UsuarioId', async () => {
            // Arrange
            const dtoSinUsuario = { UsuarioId: undefined, ProductoId: 10 } as any;

            // Act & Assert
            await expect(service.agregarFavorito(dtoSinUsuario)).rejects.toThrow(
                new NotFoundException('El UsuarioId es requerido'),
            );
        });
    });

    describe('listarFavoritos', () => {
        it('debería listar favoritos del usuario', async () => {
            // Arrange
            repository.findAllByUsuarioId.mockResolvedValue([mockFavorito]);

            // Act
            const result = await service.listarFavoritos(5);

            // Assert
            expect(repository.findAllByUsuarioId).toHaveBeenCalledWith(5);
            expect(result).toHaveLength(1);
            expect(result[0].ProductoId).toBe(10);
        });
    });

    describe('eliminarFavorito', () => {
        it('debería eliminar un favorito exitosamente', async () => {
            // Arrange
            repository.findAllByUsuarioId.mockResolvedValue([mockFavorito]);

            // Act
            await service.eliminarFavorito(5, 10);

            // Assert
            expect(repository.findAllByUsuarioId).toHaveBeenCalledWith(5);
            expect(repository.removeByUsuarioYProducto).toHaveBeenCalledWith(5, 10);
        });

        it('debería lanzar NotFoundException si no existe el favorito', async () => {
            // Arrange
            repository.findAllByUsuarioId.mockResolvedValue([]);

            // Act & Assert
            await expect(service.eliminarFavorito(5, 10)).rejects.toThrow(
                new NotFoundException('El favorito no existe'),
            );
            expect(repository.removeByUsuarioYProducto).not.toHaveBeenCalled();
        });
    });
});
