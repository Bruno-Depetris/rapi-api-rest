import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CategoriasProductosService } from './categoriaproducto.service';
import { CategoriaProductoRepository } from '../Repositories/categoria.repository';

describe('CategoriasProductosService', () => {
    let service: CategoriasProductosService;
    let repository: jest.Mocked<CategoriaProductoRepository>;

    const mockCategoria = {
        CategoriaProductoId: 1,
        Nombre: 'Pizzas',
    };

    beforeEach(async () => {
        const mockRepo = {
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
                CategoriasProductosService,
                { provide: CategoriaProductoRepository, useValue: mockRepo },
            ],
        }).compile();

        service = module.get<CategoriasProductosService>(CategoriasProductosService);
        repository = module.get(CategoriaProductoRepository);
    });

    it('debería listar todas las categorías', async () => {
        repository.findAll.mockResolvedValue([mockCategoria] as any);
        const result = await service.listarCategorias();
        expect(result).toHaveLength(1);
    });

    it('debería obtener una categoría por ID', async () => {
        repository.findById.mockResolvedValue(mockCategoria as any);
        const result = await service.obtenerCategoria(1);
        expect(result.nombre).toBe('Pizzas');
    });

    it('debería crear una categoría', async () => {
        repository.existsByNombre.mockResolvedValue(false);
        repository.create.mockResolvedValue(mockCategoria as any);
        const result = await service.crearCategoria({ Nombre: 'Pizzas' });
        expect(result.message).toBe('Categoría creada exitosamente');
    });

    it('debería lanzar ConflictException si categoría existe', async () => {
        repository.existsByNombre.mockResolvedValue(true);
        await expect(service.crearCategoria({ Nombre: 'Pizzas' })).rejects.toThrow(ConflictException);
    });

    it('debería actualizar una categoría', async () => {
        repository.findById.mockResolvedValue(mockCategoria as any);
        repository.findByNombre.mockResolvedValue(null);
        repository.update.mockResolvedValue({ ...mockCategoria, Nombre: 'Pizzas Premium' } as any);
        const result = await service.actualizarCategoria(1, { Nombre: 'Pizzas Premium' });
        expect(result.message).toBe('Categoría actualizada exitosamente');
    });

    it('debería eliminar una categoría', async () => {
        repository.findById.mockResolvedValue(mockCategoria as any);
        const result = await service.eliminarCategoria(1);
        expect(result.message).toBe('Categoría eliminada exitosamente');
    });
});