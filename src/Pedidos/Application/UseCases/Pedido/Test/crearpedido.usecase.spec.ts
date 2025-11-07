import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CrearPedidoUseCase } from '../crearpedido.usecase';
import { PedidoRepository } from '../../../../Infrastructure/Persistence/pedido.repository';
import { DetallePedidoRepository } from '../../../../Infrastructure/Persistence/detallepedido.repository';
import { CarritoRepository } from '../../../../Infrastructure/Persistence/carrito.repository';
import { MetodoPagoRepository } from '../../../../Infrastructure/Persistence/metodopago.repository';
import { IUsuarioPort } from '../../../../Infrastructure/Ports/Outbound/usuario.port';
import { IRepartidorPort } from '../../../../Infrastructure/Ports/Outbound/repartidor.port';
import { CrearPedidoDto } from '../../../DTOs/crearpedido.dto';
import { Carrito } from '../../../../Domain/Entities/carrito.entity';
import { Pedido } from '../../../../Domain/Entities/pedido.entity';
import { MetodoPago } from '../../../../Domain/Entities/metodopago.entity';

describe('CrearPedidoUseCase', () => {
  let useCase: CrearPedidoUseCase;
  let pedidoRepository: jest.Mocked<PedidoRepository>;
  let detallePedidoRepository: jest.Mocked<DetallePedidoRepository>;
  let carritoRepository: jest.Mocked<CarritoRepository>;
  let metodoPagoRepository: jest.Mocked<MetodoPagoRepository>;
  let usuarioPort: jest.Mocked<IUsuarioPort>;
  let repartidorPort: jest.Mocked<IRepartidorPort>;

  const createMockCarrito = (overrides?: Partial<Carrito>): Carrito => ({
    CarritoId: 1,
    UsuarioId: 1,
    Estado: 'Activo',
    Subtotal: 50000,
    TotalDescuentos: 5000,
    Total: 45000,
    FechaCreacion: new Date(),
    FechaConversion: null,
    IsDeleted: false,
    items: [
      {
        CarritoItemId: 1,
        CarritoId: 1,
        ProductoId: 10,
        Cantidad: 2,
        PrecioUnitario: 25000,
        Subtotal: 50000,
        IsDeleted: false,
      } as any,
    ],
    cupones: [],
    ...overrides,
  } as Carrito);

  const createMockPedido = (overrides?: Partial<Pedido>): Pedido => ({
    PedidoId: 100,
    UsuarioId: 1,
    CarritoId: 1,
    RepartidorId: null,
    MetodoPagoId: 1,
    Estado: 'Pendiente',
    SubtotalProductos: 50000,
    TotalDescuentos: 5000,
    CostoEnvio: 5000,
    Total: 50000,
    FechaCreacion: new Date(),
    FechaEntrega: null,
    Resenia: null,
    IsDeleted: false,
    ...overrides,
  } as Pedido);

  const mockMetodoPago: MetodoPago = {
    MetodoId: 1,
    Metodo: 'Efectivo',
    IsDeleted: false,
  };

  beforeEach(async () => {
    const mockPedidoRepo = {
      create: jest.fn(),
      findById: jest.fn(),
    };

    const mockDetallePedidoRepo = {
      createMultiple: jest.fn(),
    };

    const mockCarritoRepo = {
      findById: jest.fn(),
      convertirACompra: jest.fn(),
    };

    const mockMetodoPagoRepo = {
      findById: jest.fn(),
    };

    const mockUsuarioPort = {
      validarExiste: jest.fn(),
      obtenerDatos: jest.fn(),
    };

    const mockRepartidorPort = {
      validarExiste: jest.fn(),
      obtenerPorUsuarioId: jest.fn(),
      obtenerDireccionEntrega: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrearPedidoUseCase,
        { provide: PedidoRepository, useValue: mockPedidoRepo },
        { provide: DetallePedidoRepository, useValue: mockDetallePedidoRepo },
        { provide: CarritoRepository, useValue: mockCarritoRepo },
        { provide: MetodoPagoRepository, useValue: mockMetodoPagoRepo },
        { provide: 'IUsuarioPort', useValue: mockUsuarioPort },
        { provide: 'IRepartidorPort', useValue: mockRepartidorPort },
      ],
    }).compile();

    useCase = module.get<CrearPedidoUseCase>(CrearPedidoUseCase);
    pedidoRepository = module.get(PedidoRepository);
    detallePedidoRepository = module.get(DetallePedidoRepository);
    carritoRepository = module.get(CarritoRepository);
    metodoPagoRepository = module.get(MetodoPagoRepository);
    usuarioPort = module.get('IUsuarioPort');
    repartidorPort = module.get('IRepartidorPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ejecutar', () => {
    const dto: CrearPedidoDto = {
      CarritoId: 1,
      MetodoPagoId: 1,
    };

    it('debería crear un pedido exitosamente', async () => {
      // Arrange
      const mockCarrito = createMockCarrito();
      const mockPedido = createMockPedido();

      usuarioPort.validarExiste.mockResolvedValue(true);
      carritoRepository.findById.mockResolvedValue(mockCarrito);
      metodoPagoRepository.findById.mockResolvedValue(mockMetodoPago);
      pedidoRepository.create.mockResolvedValue(mockPedido);

      // Act
      const result = await useCase.ejecutar(1, dto);

      // Assert
      expect(usuarioPort.validarExiste).toHaveBeenCalledWith(1);
      expect(carritoRepository.findById).toHaveBeenCalledWith(dto.CarritoId);
      expect(metodoPagoRepository.findById).toHaveBeenCalledWith(dto.MetodoPagoId);
      
      expect(pedidoRepository.create).toHaveBeenCalledWith({
        UsuarioId: 1,
        CarritoId: 1,
        MetodoPagoId: 1,
        RepartidorId: undefined,
        Estado: 'Pendiente',
        SubtotalProductos: 50000,
        TotalDescuentos: 5000,
        CostoEnvio: 5000,
        Total: 50000, // 45000 + 5000
        Resenia: undefined,
      });

      expect(detallePedidoRepository.createMultiple).toHaveBeenCalledWith([
        {
          PedidoId: 100,
          ProductoId: 10,
          Cantidad: 2,
          PrecioUnitario: 25000,
          Subtotal: 50000,
        },
      ]);

      expect(carritoRepository.convertirACompra).toHaveBeenCalledWith(1);
      
      expect(result.message).toBe('Pedido creado exitosamente');
      expect(result.pedido.pedidoId).toBe(100);
      expect(result.pedido.estado).toBe('Pendiente');
      expect(result.pedido.total).toBe(50000);
    });

    it('debería crear pedido con repartidor asignado', async () => {
      // Arrange
      const dtoConRepartidor: CrearPedidoDto = {
        ...dto,
        RepartidorId: 5,
      };
      const mockCarrito = createMockCarrito();
      const mockPedido = createMockPedido({ RepartidorId: 5 });

      usuarioPort.validarExiste.mockResolvedValue(true);
      carritoRepository.findById.mockResolvedValue(mockCarrito);
      metodoPagoRepository.findById.mockResolvedValue(mockMetodoPago);
      repartidorPort.validarExiste.mockResolvedValue(true);
      pedidoRepository.create.mockResolvedValue(mockPedido);

      // Act
      await useCase.ejecutar(1, dtoConRepartidor);

      // Assert
      expect(repartidorPort.validarExiste).toHaveBeenCalledWith(5);
      expect(pedidoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          RepartidorId: 5,
        })
      );
    });

    it('debería crear pedido con reseña', async () => {
      // Arrange
      const dtoConResenia: CrearPedidoDto = {
        ...dto,
        Resenia: 'Entrega rápida por favor',
      };
      const mockCarrito = createMockCarrito();
      const mockPedido = createMockPedido({ Resenia: 'Entrega rápida por favor' });

      usuarioPort.validarExiste.mockResolvedValue(true);
      carritoRepository.findById.mockResolvedValue(mockCarrito);
      metodoPagoRepository.findById.mockResolvedValue(mockMetodoPago);
      pedidoRepository.create.mockResolvedValue(mockPedido);

      // Act
      await useCase.ejecutar(1, dtoConResenia);

      // Assert
      expect(pedidoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          Resenia: 'Entrega rápida por favor',
        })
      );
    });

    it('debería calcular el total correctamente incluyendo costo de envío', async () => {
      // Arrange
      const mockCarrito = createMockCarrito({
        Subtotal: 100000,
        TotalDescuentos: 10000,
        Total: 90000,
      });
      const mockPedido = createMockPedido();

      usuarioPort.validarExiste.mockResolvedValue(true);
      carritoRepository.findById.mockResolvedValue(mockCarrito);
      metodoPagoRepository.findById.mockResolvedValue(mockMetodoPago);
      pedidoRepository.create.mockResolvedValue(mockPedido);

      // Act
      await useCase.ejecutar(1, dto);

      // Assert
      expect(pedidoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          SubtotalProductos: 100000,
          TotalDescuentos: 10000,
          CostoEnvio: 5000,
          Total: 95000, // 90000 + 5000
        })
      );
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      // Arrange
      usuarioPort.validarExiste.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.ejecutar(1, dto)).rejects.toThrow(
        new NotFoundException('Usuario no encontrado'),
      );
      
      expect(carritoRepository.findById).not.toHaveBeenCalled();
      expect(pedidoRepository.create).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el carrito no existe', async () => {
      // Arrange
      usuarioPort.validarExiste.mockResolvedValue(true);
      carritoRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.ejecutar(1, dto)).rejects.toThrow(
        new NotFoundException('Carrito no encontrado'),
      );
      
      expect(metodoPagoRepository.findById).not.toHaveBeenCalled();
      expect(pedidoRepository.create).not.toHaveBeenCalled();
    });

    it('debería lanzar ForbiddenException si el carrito no pertenece al usuario', async () => {
      // Arrange
      const carritoDeOtroUsuario = createMockCarrito({ UsuarioId: 999 });
      
      usuarioPort.validarExiste.mockResolvedValue(true);
      carritoRepository.findById.mockResolvedValue(carritoDeOtroUsuario);

      // Act & Assert
      await expect(useCase.ejecutar(1, dto)).rejects.toThrow(
        new ForbiddenException('Este carrito no te pertenece'),
      );
      
      expect(metodoPagoRepository.findById).not.toHaveBeenCalled();
      expect(pedidoRepository.create).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si el carrito no está activo', async () => {
      // Arrange
      const carritoInactivo = createMockCarrito({ Estado: 'Convertido' });
      
      usuarioPort.validarExiste.mockResolvedValue(true);
      carritoRepository.findById.mockResolvedValue(carritoInactivo);

      // Act & Assert
      await expect(useCase.ejecutar(1, dto)).rejects.toThrow(
        new BadRequestException('Este carrito ya no está activo'),
      );
      
      expect(pedidoRepository.create).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si el carrito está vacío', async () => {
      // Arrange
      const carritoVacio = createMockCarrito({ items: [] });
      
      usuarioPort.validarExiste.mockResolvedValue(true);
      carritoRepository.findById.mockResolvedValue(carritoVacio);

      // Act & Assert
      await expect(useCase.ejecutar(1, dto)).rejects.toThrow(
        new BadRequestException('El carrito está vacío'),
      );
      
      expect(pedidoRepository.create).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si items es null', async () => {
      // Arrange
      const carritoSinItems = createMockCarrito({ items: undefined });
      
      usuarioPort.validarExiste.mockResolvedValue(true);
      carritoRepository.findById.mockResolvedValue(carritoSinItems);

      // Act & Assert
      await expect(useCase.ejecutar(1, dto)).rejects.toThrow(
        new BadRequestException('El carrito está vacío'),
      );
    });

    it('debería lanzar NotFoundException si el método de pago no existe', async () => {
      // Arrange
      const mockCarrito = createMockCarrito();
      
      usuarioPort.validarExiste.mockResolvedValue(true);
      carritoRepository.findById.mockResolvedValue(mockCarrito);
      metodoPagoRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.ejecutar(1, dto)).rejects.toThrow(
        new NotFoundException('Método de pago no encontrado'),
      );
      
      expect(pedidoRepository.create).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el repartidor no existe', async () => {
      // Arrange
      const dtoConRepartidor: CrearPedidoDto = {
        ...dto,
        RepartidorId: 5,
      };
      const mockCarrito = createMockCarrito();
      
      usuarioPort.validarExiste.mockResolvedValue(true);
      carritoRepository.findById.mockResolvedValue(mockCarrito);
      metodoPagoRepository.findById.mockResolvedValue(mockMetodoPago);
      repartidorPort.validarExiste.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.ejecutar(1, dtoConRepartidor)).rejects.toThrow(
        new NotFoundException('Repartidor no encontrado'),
      );
      
      expect(pedidoRepository.create).not.toHaveBeenCalled();
    });

    it('debería crear múltiples detalles de pedido cuando hay varios items', async () => {
      // Arrange
      const carritoConVariosItems = createMockCarrito({
        items: [
          {
            CarritoItemId: 1,
            ProductoId: 10,
            Cantidad: 2,
            PrecioUnitario: 25000,
            Subtotal: 50000,
          } as any,
          {
            CarritoItemId: 2,
            ProductoId: 20,
            Cantidad: 1,
            PrecioUnitario: 15000,
            Subtotal: 15000,
          } as any,
          {
            CarritoItemId: 3,
            ProductoId: 30,
            Cantidad: 3,
            PrecioUnitario: 10000,
            Subtotal: 30000,
          } as any,
        ],
      });
      const mockPedido = createMockPedido();

      usuarioPort.validarExiste.mockResolvedValue(true);
      carritoRepository.findById.mockResolvedValue(carritoConVariosItems);
      metodoPagoRepository.findById.mockResolvedValue(mockMetodoPago);
      pedidoRepository.create.mockResolvedValue(mockPedido);

      // Act
      await useCase.ejecutar(1, dto);

      // Assert
      expect(detallePedidoRepository.createMultiple).toHaveBeenCalledWith([
        {
          PedidoId: 100,
          ProductoId: 10,
          Cantidad: 2,
          PrecioUnitario: 25000,
          Subtotal: 50000,
        },
        {
          PedidoId: 100,
          ProductoId: 20,
          Cantidad: 1,
          PrecioUnitario: 15000,
          Subtotal: 15000,
        },
        {
          PedidoId: 100,
          ProductoId: 30,
          Cantidad: 3,
          PrecioUnitario: 10000,
          Subtotal: 30000,
        },
      ]);
    });
  });
});