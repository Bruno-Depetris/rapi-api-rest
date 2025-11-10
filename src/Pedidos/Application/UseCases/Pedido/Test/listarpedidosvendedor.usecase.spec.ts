
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ListarMisPedidosUseCase } from '../listarmispedidos.usecase';
import { ListarPedidosVendedorUseCase } from '../listarpedidosvendedor.usecase';
import { ObtenerPedidoUseCase } from '../obtenerpedido.usecase';
import { PedidoRepository } from '../../../../Infrastructure/Persistence/pedido.repository';
import { IVendedorPort } from '../../../../Infrastructure/Ports/Outbound/vendedor.port';
import { IRepartidorPort } from '../../../../Infrastructure/Ports/Outbound/repartidor.port';
import { Negocio } from 'src/Negocios/Entities/negocio.entity';

describe('Pedidos Restantes UseCases', () => {
  let pedidoRepository: jest.Mocked<PedidoRepository>;
  let vendedorPort: jest.Mocked<IVendedorPort>;
  let repartidorPort: jest.Mocked<IRepartidorPort>;

  const mockVendedor = {
    vendedorId: 5,
    negocioId: 1,
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
});
