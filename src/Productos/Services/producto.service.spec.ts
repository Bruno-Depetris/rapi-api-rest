import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProductosService } from './producto.service';
import { ProductoRepository } from '../Repositories/producto.repository';
import { VendedorRepository } from '../../Usuarios/Repositories/vendedor.repository';
import { CrearProductoDto } from '../DTOs/crearproducto.dto';
import { ActualizarProductoDto } from '../DTOs/actualizarproducto.dto';

describe('ProductosService', () => {
    let service: ProductosService;
    let productoRepository: jest.Mocked<ProductoRepository>;
    let vendedorRepository: jest.Mocked<VendedorRepository>;

    const mockProducto = {
        ProductoId: 1,
        VendedorId: 10,
        CategoriaProductoId: 5,
        Nombre: 'Pizza Margarita',
        Precio: 15000,
        Descripcion: 'Deliciosa pizza',
        Disponibilidad: 50,
        Imagenes: 'https://example.com/pizza.jpg',
        IsDeleted: false,
    };

    const mockVendedor = {
        VendedorId: 10,
        UsuarioId: 5,
        NegocioId: 1,
    };

    beforeEach(async () => {
        const mockProductoRepo = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByVendedorId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
        };

        const mockVendedorRepo = {
            findByUsuarioId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductosService,
                { provide: ProductoRepository, useValue: mockProductoRepo },
                { provide: VendedorRepository, useValue: mockVendedorRepo },
            ],
        }).compile();

        service = module.get<ProductosService>(ProductosService);
        productoRepository = module.get(ProductoRepository);
        vendedorRepository = module.get(VendedorRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('listarProductos', () => {
        it('debería listar todos los productos', async () => {

            productoRepository.findAll.mockResolvedValue([mockProducto] as any);


            const result = await service.listarProductos();


            expect(productoRepository.findAll).toHaveBeenCalled();
            expect(result).toHaveLength(1);
            expect(result[0].nombre).toBe('Pizza Margarita');
        });
    });

    describe('obtenerProducto', () => {
        it('debería obtener un producto por ID', async () => {

            productoRepository.findById.mockResolvedValue(mockProducto as any);


            const result = await service.obtenerProducto(1);


            expect(productoRepository.findById).toHaveBeenCalledWith(1);
            expect(result.productoId).toBe(1);
            expect(result.nombre).toBe('Pizza Margarita');
        });

        it('debería lanzar NotFoundException si no existe', async () => {

            productoRepository.findById.mockResolvedValue(null);


            await expect(service.obtenerProducto(999)).rejects.toThrow(
                new NotFoundException('Producto no encontrado'),
            );
        });

        it('debería lanzar NotFoundException si está eliminado', async () => {

            productoRepository.findById.mockResolvedValue({
                ...mockProducto,
                IsDeleted: true,
            } as any);


            await expect(service.obtenerProducto(1)).rejects.toThrow(
                new NotFoundException('Producto no encontrado'),
            );
        });
    });

    describe('obtenerMisProductos', () => {
        it('debería obtener productos del vendedor', async () => {

            vendedorRepository.findByUsuarioId.mockResolvedValue(mockVendedor as any);
            productoRepository.findByVendedorId.mockResolvedValue([mockProducto] as any);


            const result = await service.obtenerMisProductos(5);


            expect(vendedorRepository.findByUsuarioId).toHaveBeenCalledWith(5);
            expect(productoRepository.findByVendedorId).toHaveBeenCalledWith(10);
            expect(result).toHaveLength(1);
        });

        it('debería lanzar NotFoundException si no es vendedor', async () => {

            vendedorRepository.findByUsuarioId.mockResolvedValue(null);


            await expect(service.obtenerMisProductos(5)).rejects.toThrow(
                new NotFoundException('No eres vendedor'),
            );
        });
    });

    describe('crearProducto', () => {
        const dto: CrearProductoDto = {
            CategoriaProductoId: 5,
            Nombre: 'Pizza Margarita',
            Precio: 15000,
            Descripcion: 'Deliciosa pizza',
            Disponibilidad: 50,
            Imagenes: ['https:example.com/pizza.jpg'],
        };

        it('debería crear un producto exitosamente', async () => {

            vendedorRepository.findByUsuarioId.mockResolvedValue(mockVendedor as any);
            productoRepository.create.mockResolvedValue(mockProducto as any);


            const result = await service.crearProducto(5, dto);


            expect(vendedorRepository.findByUsuarioId).toHaveBeenCalledWith(5);
            expect(productoRepository.create).toHaveBeenCalledWith({
                ...dto,
                VendedorId: 10,
            });
            expect(result.message).toBe('Producto creado exitosamente');
            expect(result.producto.nombre).toBe('Pizza Margarita');
        });

        it('debería lanzar ForbiddenException si no es vendedor', async () => {

            vendedorRepository.findByUsuarioId.mockResolvedValue(null);


            await expect(service.crearProducto(5, dto)).rejects.toThrow(
                new ForbiddenException('No eres vendedor'),
            );
        });
    });

    describe('ualizarProducto', () => {
        const dto: ActualizarProductoDto = {
            Nombre: 'Pizza Margarita Especial',
            Precio: 18000,
        };

        it('debería ualizar producto exitosamente', async () => {

            const productoualizado = { ...mockProducto, ...dto };
            vendedorRepository.findByUsuarioId.mockResolvedValue(mockVendedor as any);
            productoRepository.findById.mockResolvedValue(mockProducto as any);
            productoRepository.update.mockResolvedValue(productoualizado as any);


            const result = await service.actualizarProducto(5, 1, dto);


            expect(productoRepository.update).toHaveBeenCalledWith(1, dto);
            expect(result.message).toBe('Producto ualizado exitosamente');
        });

        it('debería lanzar ForbiddenException si no es el vendedor propietario', async () => {

            vendedorRepository.findByUsuarioId.mockResolvedValue({
                ...mockVendedor,
                VendedorId: 999,
            } as any);
            productoRepository.findById.mockResolvedValue(mockProducto as any);


            await expect(service.actualizarProducto(5, 1, dto)).rejects.toThrow(
                new ForbiddenException('No tienes permiso para editar este producto'),
            );
        });
    });

    describe('eliminarProducto', () => {
        it('debería eliminar producto como admin', async () => {

            productoRepository.findById.mockResolvedValue(mockProducto as any);


            const result = await service.eliminarProducto(999, 1, 'admin');


            expect(productoRepository.softDelete).toHaveBeenCalledWith(1);
            expect(result.message).toBe('Producto eliminado exitosamente');
        });

        it('debería eliminar producto como vendedor propietario', async () => {

            productoRepository.findById.mockResolvedValue(mockProducto as any);
            vendedorRepository.findByUsuarioId.mockResolvedValue(mockVendedor as any);


            const result = await service.eliminarProducto(5, 1, 'vendedor');


            expect(productoRepository.softDelete).toHaveBeenCalledWith(1);
        });

        it('debería lanzar ForbiddenException si no es propietario', async () => {

            productoRepository.findById.mockResolvedValue(mockProducto as any);
            vendedorRepository.findByUsuarioId.mockResolvedValue({
                ...mockVendedor,
                VendedorId: 999,
            } as any);


            await expect(service.eliminarProducto(5, 1, 'vendedor')).rejects.toThrow(
                new ForbiddenException('No tienes permiso para eliminar este producto'),
            );
        });
    });
});