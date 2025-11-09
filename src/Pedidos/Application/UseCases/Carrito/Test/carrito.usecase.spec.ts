import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ActualizarItemUseCase } from '../actualizarItem.usecase';
import { EliminarItemUseCase } from '../eliminarItem.usecase';
import { ObtenerCarritoUseCase } from '../obtenercarrito.usecase';
import { RemoverCuponUseCase } from '../removercupon.usecase';
import { VaciarCarritoUseCase } from '../vaciarCarrito.usecase';
import { AplicarCuponUseCase } from '../aplicarcupon.usecase';
import { CarritoRepository } from '../../../../Infrastructure/Persistence/carrito.repository';
import { CarritoItemRepository } from '../../../../Infrastructure/Persistence/carritoitem.repository';
import { CarritoCuponRepository } from '../../../../Infrastructure/Persistence/carritocupon.repository';
import { CuponRepository } from '../../../../Infrastructure/Persistence/cupon.repository';
import { IProductoPort } from '../../../../Infrastructure/Ports/Outbound/producto.port';

describe('Carrito UseCases', () => {
    let carritoRepository: jest.Mocked<CarritoRepository>;
    let carritoItemRepository: jest.Mocked<CarritoItemRepository>;
    let carritoCuponRepository: jest.Mocked<CarritoCuponRepository>;
    let cuponRepository: jest.Mocked<CuponRepository>;
    let productoPort: jest.Mocked<IProductoPort>;

    const mockCarrito = {
        CarritoId: 1,
        UsuarioId: 1,
        Estado: 'Activo',
        Subtotal: 50000,
        TotalDescuentos: 0,
        Total: 50000,
        items: [{ CarritoItemId: 1 }],
    };

    const mockCarritoItem = {
        CarritoItemId: 1,
        CarritoId: 1,
        ProductoId: 10,
        Cantidad: 2,
        PrecioUnitario: 25000,
        Subtotal: 50000,
    };

    const mockCupon = {
        CuponId: 1,
        Codigo: 'DESC20',
        Descuento: 20,
        TipoDescuento: 'porcentaje',
        FechaExpiracion: new Date('2026-12-31'),
        UsosMaximos: 100,
        UsosActuales: 5,
    };

    beforeEach(async () => {
        carritoRepository = {
            findCarritoActivo: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            actualizarTotales: jest.fn(),
        } as any;

        carritoItemRepository = {
            findById: jest.fn(),
            findByCarritoYProducto: jest.fn(),
            actualizarCantidad: jest.fn(),
            softDelete: jest.fn(),
            deleteByCarritoId: jest.fn(),
            sumTotalByCarrito: jest.fn(),
        } as any;

        carritoCuponRepository = {
            findById: jest.fn(),
            existeCuponEnCarrito: jest.fn(),
            create: jest.fn(),
            softDelete: jest.fn(),
            deleteByCarritoId: jest.fn(),
            sumDescuentosByCarrito: jest.fn(),
        } as any;

        cuponRepository = {
            findByCodigo: jest.fn(),
            incrementarUso: jest.fn(),
            decrementarUso: jest.fn(),
        } as any;

        productoPort = {
            validarStock: jest.fn(),
            obtenerDatos: jest.fn(),
        } as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('ActualizarItemUseCase', () => {
        let useCase: ActualizarItemUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ActualizarItemUseCase,
                    { provide: CarritoRepository, useValue: carritoRepository },
                    { provide: CarritoItemRepository, useValue: carritoItemRepository },
                    { provide: CarritoCuponRepository, useValue: carritoCuponRepository },
                    { provide: 'IProductoPort', useValue: productoPort },
                ],
            }).compile();
            useCase = module.get(ActualizarItemUseCase);
        });

        it('debería actualizar la cantidad de un item', async () => {
            carritoItemRepository.findById.mockResolvedValue(mockCarritoItem as any);
            carritoRepository.findById.mockResolvedValueOnce(mockCarrito as any);
            productoPort.validarStock.mockResolvedValue(true);
            carritoItemRepository.sumTotalByCarrito.mockResolvedValue(75000);
            carritoCuponRepository.sumDescuentosByCarrito.mockResolvedValue(0);
            carritoRepository.findById.mockResolvedValueOnce({ ...mockCarrito, Total: 75000 } as any);

            const result = await useCase.ejecutar(1, 1, { Cantidad: 3 });

            expect(carritoItemRepository.actualizarCantidad).toHaveBeenCalled();
            expect(result.message).toBe('Cantidad actualizada');
        });

        it('debería lanzar NotFoundException si el item no existe', async () => {
            carritoItemRepository.findById.mockResolvedValue(null);

            await expect(useCase.ejecutar(1, 999, { Cantidad: 3 })).rejects.toThrow(
                new NotFoundException('Item no encontrado'),
            );
        });

        it('debería lanzar ForbiddenException si no es su carrito', async () => {
            carritoItemRepository.findById.mockResolvedValue(mockCarritoItem as any);
            carritoRepository.findById.mockResolvedValue({ ...mockCarrito, UsuarioId: 999 } as any);

            await expect(useCase.ejecutar(1, 1, { Cantidad: 3 })).rejects.toThrow(
                new ForbiddenException('No tienes permiso para modificar este carrito'),
            );
        });

        it('debería lanzar BadRequestException si no hay stock', async () => {
            carritoItemRepository.findById.mockResolvedValue(mockCarritoItem as any);
            carritoRepository.findById.mockResolvedValue(mockCarrito as any);
            productoPort.validarStock.mockResolvedValue(false);

            await expect(useCase.ejecutar(1, 1, { Cantidad: 100 })).rejects.toThrow(
                new BadRequestException('Stock insuficiente'),
            );
        });
    });

    describe('EliminarItemUseCase', () => {
        let useCase: EliminarItemUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    EliminarItemUseCase,
                    { provide: CarritoRepository, useValue: carritoRepository },
                    { provide: CarritoItemRepository, useValue: carritoItemRepository },
                    { provide: CarritoCuponRepository, useValue: carritoCuponRepository },
                ],
            }).compile();
            useCase = module.get(EliminarItemUseCase);
        });

        it('debería eliminar un item del carrito', async () => {
            carritoItemRepository.findById.mockResolvedValue(mockCarritoItem as any);
            carritoRepository.findById.mockResolvedValue(mockCarrito as any);
            carritoItemRepository.sumTotalByCarrito.mockResolvedValue(0);
            carritoCuponRepository.sumDescuentosByCarrito.mockResolvedValue(0);

            const result = await useCase.ejecutar(1, 1);

            expect(carritoItemRepository.softDelete).toHaveBeenCalledWith(1);
            expect(result.message).toBe('Producto eliminado del carrito');
        });

        it('debería lanzar NotFoundException si el item no existe', async () => {
            carritoItemRepository.findById.mockResolvedValue(null);

            await expect(useCase.ejecutar(1, 999)).rejects.toThrow(
                new NotFoundException('Item no encontrado'),
            );
        });

        it('debería lanzar ForbiddenException si no es su carrito', async () => {
            carritoItemRepository.findById.mockResolvedValue(mockCarritoItem as any);
            carritoRepository.findById.mockResolvedValue({ ...mockCarrito, UsuarioId: 999 } as any);

            await expect(useCase.ejecutar(1, 1)).rejects.toThrow(
                new ForbiddenException('No tienes permiso para modificar este carrito'),
            );
        });
    });

    describe('ObtenerCarritoUseCase', () => {
        let useCase: ObtenerCarritoUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ObtenerCarritoUseCase,
                    { provide: CarritoRepository, useValue: carritoRepository },
                ],
            }).compile();
            useCase = module.get(ObtenerCarritoUseCase);
        });

        it('debería obtener el carrito activo del usuario', async () => {
            carritoRepository.findCarritoActivo.mockResolvedValue({
                ...mockCarrito,
                items: [],
                cupones: [],
            } as any);

            const result = await useCase.ejecutar(1);

            expect(result.carritoId).toBe(1);
            expect(result.total).toBe(50000);
        });

        it('debería crear un carrito nuevo si no existe', async () => {
            carritoRepository.findCarritoActivo.mockResolvedValue(null);
            carritoRepository.create.mockResolvedValue({
                CarritoId: 2,
                UsuarioId: 1,
                Estado: 'Activo',
                Subtotal: 0,
                Total: 0,
                items: [],
                cupones: [],
            } as any);

            const result = await useCase.ejecutar(1);

            expect(carritoRepository.create).toHaveBeenCalled();
            expect(result.carritoId).toBe(2);
        });
    });

    describe('AplicarCuponUseCase', () => {
        let useCase: AplicarCuponUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    AplicarCuponUseCase,
                    { provide: CarritoRepository, useValue: carritoRepository },
                    { provide: CarritoCuponRepository, useValue: carritoCuponRepository },
                    { provide: CarritoItemRepository, useValue: carritoItemRepository },
                    { provide: CuponRepository, useValue: cuponRepository },
                ],
            }).compile();
            useCase = module.get(AplicarCuponUseCase);
        });

        it('debería aplicar un cupón correctamente', async () => {
            carritoRepository.findCarritoActivo.mockResolvedValue(mockCarrito as any);
            cuponRepository.findByCodigo.mockResolvedValue(mockCupon as any);
            carritoCuponRepository.existeCuponEnCarrito.mockResolvedValue(false);
            carritoItemRepository.sumTotalByCarrito.mockResolvedValue(50000);
            carritoCuponRepository.sumDescuentosByCarrito.mockResolvedValue(10000);
            carritoRepository.findById.mockResolvedValue({
                ...mockCarrito,
                TotalDescuentos: 10000,
                Total: 40000,
            } as any);

            const result = await useCase.ejecutar(1, { Codigo: 'DESC20' });

            expect(cuponRepository.incrementarUso).toHaveBeenCalledWith(1);
            expect(result.message).toBe('Cupón aplicado exitosamente');
        });

        it('debería lanzar NotFoundException si no hay carrito', async () => {
            carritoRepository.findCarritoActivo.mockResolvedValue(null);

            await expect(useCase.ejecutar(1, { Codigo: 'DESC20' })).rejects.toThrow(
                new NotFoundException('No tienes un carrito activo'),
            );
        });

        it('debería lanzar BadRequestException si el carrito está vacío', async () => {
            carritoRepository.findCarritoActivo.mockResolvedValue({
                ...mockCarrito,
                items: [],
            } as any);

            await expect(useCase.ejecutar(1, { Codigo: 'DESC20' })).rejects.toThrow(
                new BadRequestException('El carrito está vacío'),
            );
        });

        it('debería lanzar NotFoundException si el cupón no existe', async () => {
            carritoRepository.findCarritoActivo.mockResolvedValue(mockCarrito as any);
            cuponRepository.findByCodigo.mockResolvedValue(null);

            await expect(useCase.ejecutar(1, { Codigo: 'FAKE' })).rejects.toThrow(
                new NotFoundException('Cupón no encontrado'),
            );
        });
    });

    describe('RemoverCuponUseCase', () => {
        let useCase: RemoverCuponUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    RemoverCuponUseCase,
                    { provide: CarritoRepository, useValue: carritoRepository },
                    { provide: CarritoCuponRepository, useValue: carritoCuponRepository },
                    { provide: CarritoItemRepository, useValue: carritoItemRepository },
                    { provide: CuponRepository, useValue: cuponRepository },
                ],
            }).compile();
            useCase = module.get(RemoverCuponUseCase);
        });

        it('debería remover un cupón del carrito', async () => {
            const mockCarritoCupon = { CarritoCuponId: 1, CarritoId: 1, CuponId: 1 };
            carritoCuponRepository.findById.mockResolvedValue(mockCarritoCupon as any);
            carritoRepository.findById.mockResolvedValueOnce(mockCarrito as any);
            carritoItemRepository.sumTotalByCarrito.mockResolvedValue(50000);
            carritoCuponRepository.sumDescuentosByCarrito.mockResolvedValue(0);
            carritoRepository.findById.mockResolvedValueOnce(mockCarrito as any);

            const result = await useCase.ejecutar(1, 1);

            expect(cuponRepository.decrementarUso).toHaveBeenCalledWith(1);
            expect(carritoCuponRepository.softDelete).toHaveBeenCalledWith(1);
            expect(result.message).toBe('Cupón removido');
        });

        it('debería lanzar NotFoundException si el cupón no está en el carrito', async () => {
            carritoCuponRepository.findById.mockResolvedValue(null);

            await expect(useCase.ejecutar(1, 999)).rejects.toThrow(
                new NotFoundException('Cupón no encontrado en el carrito'),
            );
        });
    });

    describe('VaciarCarritoUseCase', () => {
        let useCase: VaciarCarritoUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    VaciarCarritoUseCase,
                    { provide: CarritoRepository, useValue: carritoRepository },
                    { provide: CarritoItemRepository, useValue: carritoItemRepository },
                    { provide: CarritoCuponRepository, useValue: carritoCuponRepository },
                ],
            }).compile();
            useCase = module.get(VaciarCarritoUseCase);
        });

        it('debería vaciar el carrito completamente', async () => {
            carritoRepository.findCarritoActivo.mockResolvedValue(mockCarrito as any);

            const result = await useCase.ejecutar(1);

            expect(carritoItemRepository.deleteByCarritoId).toHaveBeenCalledWith(1);
            expect(carritoCuponRepository.deleteByCarritoId).toHaveBeenCalledWith(1);
            expect(carritoRepository.actualizarTotales).toHaveBeenCalledWith(1, 0, 0, 0);
            expect(result.message).toBe('Carrito vaciado exitosamente');
        });

        it('debería lanzar NotFoundException si no hay carrito', async () => {
            carritoRepository.findCarritoActivo.mockResolvedValue(null);

            await expect(useCase.ejecutar(1)).rejects.toThrow(
                new NotFoundException('No tienes un carrito activo'),
            );
        });
    });
});
