import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ListarMisPedidosUseCase } from '../listarmispedidos.usecase';
import { ListarPedidosVendedorUseCase } from '../listarpedidosvendedor.usecase';
import { ObtenerPedidoUseCase } from '../obtenerpedido.usecase';
import { PedidoRepository } from '../../../../Infrastructure/Persistence/pedido.repository';
import { IVendedorPort } from '../../../../Infrastructure/Ports/Outbound/vendedor.port';
import { IRepartidorPort } from '../../../../Infrastructure/Ports/Outbound/repartidor.port';

describe('Pedidos Restantes UseCases', () => {
    let pedidoRepository: jest.Mocked<PedidoRepository>;
    let vendedorPort: jest.Mocked<IVendedorPort>;
    let repartidorPort: jest.Mocked<IRepartidorPort>;

    const mockVendedor = {
        vendedorId: 5,
        negocioId: 1, 
    };

    const mockRepartidor = {
        repartidorId: 10,
        vehiculo: 'Moto', 
    };

    const mockPedido = {
        PedidoId: 100,
        UsuarioId: 1,
        CarritoId: 1,
        RepartidorId: 10,
        MetodoPagoId: 1,
        Estado: 'Pendiente',
        SubtotalProductos: 50000,
        TotalDescuentos: 5000,
        CostoEnvio: 5000,
        Total: 50000,
        FechaCreacion: new Date(),
        FechaEntrega: null,
        Resenia: null,
        detalles: [
            {
                DetallePedidoId: 1,
                ProductoId: 10,
                Cantidad: 2,
                PrecioUnitario: 25000,
                Subtotal: 50000,
                producto: { Nombre: 'Pizza' },
            },
        ],
        metodoPago: {
            MetodoId: 1,
            Metodo: 'Efectivo',
        },
    };

    beforeEach(() => {
        pedidoRepository = {
            findByUsuarioId: jest.fn(),
            countByUsuario: jest.fn(),
            findById: jest.fn(),
            createQueryBuilder: jest.fn(),
        } as any;

        vendedorPort = {
            obtenerPorUsuarioId: jest.fn(),
            validarTieneProductoEnPedido: jest.fn(),
        } as any;

        repartidorPort = {
            obtenerPorUsuarioId: jest.fn(),
        } as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('ListarMisPedidosUseCase', () => {
        let useCase: ListarMisPedidosUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ListarMisPedidosUseCase,
                    { provide: PedidoRepository, useValue: pedidoRepository },
                ],
            }).compile();
            useCase = module.get(ListarMisPedidosUseCase);
        });

        it('debería listar pedidos del usuario con paginación', async () => {
            const pedidos = [
                { ...mockPedido, detalles: [{ DetallePedidoId: 1 }] },
                { ...mockPedido, PedidoId: 101, detalles: [{ DetallePedidoId: 2 }] },
            ];
            pedidoRepository.findByUsuarioId.mockResolvedValue(pedidos as any);
            pedidoRepository.countByUsuario.mockResolvedValue(2);

            const result = await useCase.ejecutar(1, 1, 10);

            expect(pedidoRepository.findByUsuarioId).toHaveBeenCalledWith(1);
            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(result.totalPages).toBe(1);
            expect(result.data[0].cantidadProductos).toBe(1);
        });

        it('debería paginar correctamente', async () => {
            const pedidos = Array(15).fill(null).map((_, i) => ({
                ...mockPedido,
                PedidoId: i + 1,
                detalles: [],
            }));
            pedidoRepository.findByUsuarioId.mockResolvedValue(pedidos as any);
            pedidoRepository.countByUsuario.mockResolvedValue(15);

            const result = await useCase.ejecutar(1, 2, 10);

            expect(result.data).toHaveLength(5);
            expect(result.page).toBe(2);
            expect(result.totalPages).toBe(2);
        });
    });

    describe('ListarPedidosVendedorUseCase', () => {
        let useCase: ListarPedidosVendedorUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ListarPedidosVendedorUseCase,
                    { provide: PedidoRepository, useValue: pedidoRepository },
                    { provide: 'IVendedorPort', useValue: vendedorPort },
                ],
            }).compile();
            useCase = module.get(ListarPedidosVendedorUseCase);
        });

        it('debería listar pedidos que incluyen productos del vendedor', async () => {
            vendedorPort.obtenerPorUsuarioId.mockResolvedValue(mockVendedor);

            const mockQuery = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([
                    {
                        ...mockPedido,
                        detalles: [
                            {
                                DetallePedidoId: 1,
                                ProductoId: 10,
                                Cantidad: 2,
                                Subtotal: 50000,
                                producto: { VendedorId: 5, Nombre: 'Pizza' },
                            },
                        ],
                    },
                ]),
                getCount: jest.fn().mockResolvedValue(1),
            };
            pedidoRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

            const result = await useCase.ejecutar(1, undefined, 1, 10);

            expect(vendedorPort.obtenerPorUsuarioId).toHaveBeenCalledWith(1);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].misProductos).toHaveLength(1);
            expect(result.data[0].misProductos[0].nombre).toBe('Pizza');
        });

        it('debería filtrar por estado cuando se proporciona', async () => {
            vendedorPort.obtenerPorUsuarioId.mockResolvedValue(mockVendedor);

            const mockQuery = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([]),
                getCount: jest.fn().mockResolvedValue(0),
            };
            pedidoRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

            await useCase.ejecutar(1, 'Entregado', 1, 10);

            expect(mockQuery.andWhere).toHaveBeenCalledWith('pedido.Estado = :estado', { estado: 'Entregado' });
        });

        it('debería lanzar NotFoundException si no es vendedor', async () => {
            vendedorPort.obtenerPorUsuarioId.mockResolvedValue(null);

            await expect(useCase.ejecutar(1, undefined, 1, 10)).rejects.toThrow(
                new NotFoundException('No eres vendedor'),
            );
        });
    });

    describe('ObtenerPedidoUseCase', () => {
        let useCase: ObtenerPedidoUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ObtenerPedidoUseCase,
                    { provide: PedidoRepository, useValue: pedidoRepository },
                    { provide: 'IRepartidorPort', useValue: repartidorPort },
                    { provide: 'IVendedorPort', useValue: vendedorPort },
                ],
            }).compile();
            useCase = module.get(ObtenerPedidoUseCase);
        });

        it('debería obtener pedido como dueño', async () => {
            pedidoRepository.findById.mockResolvedValue(mockPedido as any);

            const result = await useCase.ejecutar(100, 1, 'cliente');

            expect(pedidoRepository.findById).toHaveBeenCalledWith(100);
            expect(result.pedidoId).toBe(100);
            expect(result.total).toBe(50000);
            expect(result.detalles).toHaveLength(1);
        });

        it('debería obtener pedido como admin', async () => {
            const pedidoDeOtroUsuario = { ...mockPedido, UsuarioId: 999 };
            pedidoRepository.findById.mockResolvedValue(pedidoDeOtroUsuario as any);

            const result = await useCase.ejecutar(100, 5, 'admin');

            expect(result.pedidoId).toBe(100);
        });

        it('debería obtener pedido como repartidor asignado', async () => {
            pedidoRepository.findById.mockResolvedValue(mockPedido as any);
            repartidorPort.obtenerPorUsuarioId.mockResolvedValue(mockRepartidor);

            const result = await useCase.ejecutar(100, 5, 'repartidor');

            expect(repartidorPort.obtenerPorUsuarioId).toHaveBeenCalledWith(5);
            expect(result.pedidoId).toBe(100);
        });

        it('debería obtener pedido como vendedor con productos en el pedido', async () => {
            const mockVendedorLocal = { vendedorId: 20, negocioId: 2 };
            const pedidoDeOtroUsuario = { ...mockPedido, UsuarioId: 999 };
            pedidoRepository.findById.mockResolvedValue(pedidoDeOtroUsuario as any);
            vendedorPort.obtenerPorUsuarioId.mockResolvedValue(mockVendedorLocal);
            vendedorPort.validarTieneProductoEnPedido.mockResolvedValue(true);

            const result = await useCase.ejecutar(100, 5, 'vendedor');

            expect(vendedorPort.validarTieneProductoEnPedido).toHaveBeenCalledWith(20, 100);
            expect(result.pedidoId).toBe(100);
        });

        it('debería lanzar NotFoundException si el pedido no existe', async () => {
            pedidoRepository.findById.mockResolvedValue(null);

            await expect(useCase.ejecutar(999, 1, 'cliente')).rejects.toThrow(
                new NotFoundException('Pedido no encontrado'),
            );
        });

        it('debería lanzar ForbiddenException si no es el dueño', async () => {
            const pedidoDeOtroUsuario = { ...mockPedido, UsuarioId: 999 };
            pedidoRepository.findById.mockResolvedValue(pedidoDeOtroUsuario as any);

            await expect(useCase.ejecutar(100, 1, 'cliente')).rejects.toThrow(
                new ForbiddenException('No tienes permiso para ver este pedido'),
            );
        });

        it('debería lanzar ForbiddenException si repartidor no asignado al pedido', async () => {
            const mockRepartidorLocal = { repartidorId: 999, vehiculo: 'Bicicleta' };
            const pedidoDeOtroUsuario = { ...mockPedido, UsuarioId: 999 };
            pedidoRepository.findById.mockResolvedValue(pedidoDeOtroUsuario as any);
            repartidorPort.obtenerPorUsuarioId.mockResolvedValue(mockRepartidorLocal);

            await expect(useCase.ejecutar(100, 5, 'repartidor')).rejects.toThrow(
                new ForbiddenException('No tienes permiso para ver este pedido'),
            );
        });

        it('debería lanzar ForbiddenException si vendedor no tiene productos en el pedido', async () => {
            const mockVendedorLocal = { vendedorId: 20, negocioId: 2 };
            const pedidoDeOtroUsuario = { ...mockPedido, UsuarioId: 999 };
            pedidoRepository.findById.mockResolvedValue(pedidoDeOtroUsuario as any);
            vendedorPort.obtenerPorUsuarioId.mockResolvedValue(mockVendedorLocal);
            vendedorPort.validarTieneProductoEnPedido.mockResolvedValue(false);

            await expect(useCase.ejecutar(100, 5, 'vendedor')).rejects.toThrow(
                new ForbiddenException('Este pedido no incluye tus productos'),
            );
        });

        it('debería lanzar ForbiddenException si vendedor no existe', async () => {
            const pedidoDeOtroUsuario = { ...mockPedido, UsuarioId: 999 };
            pedidoRepository.findById.mockResolvedValue(pedidoDeOtroUsuario as any);
            vendedorPort.obtenerPorUsuarioId.mockResolvedValue(null);

            await expect(useCase.ejecutar(100, 5, 'vendedor')).rejects.toThrow(
                new ForbiddenException('No eres vendedor'),
            );
        });
    });
});