import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AgregarItemUseCase } from '../agregarItem.usecase';
import { CarritoRepository } from '../../../../Infrastructure/Persistence/carrito.repository';
import { CarritoItemRepository } from '../../../../Infrastructure/Persistence/carritoitem.repository';
import { IProductoPort } from '../../../../Infrastructure/Ports/Outbound/producto.port';
import { AgregarItemDto } from '../../../DTOs/agregaritem.dto';
import { Carrito } from '../../../../Domain/Entities/carrito.entity';
import { CarritoItem } from '../../../../Domain/Entities/carritoitem.entity';

describe('AgregarItemUseCase', () => {
  let useCase: AgregarItemUseCase;
  let carritoRepository: jest.Mocked<CarritoRepository>;
  let carritoItemRepository: jest.Mocked<CarritoItemRepository>;
  let productoPort: jest.Mocked<IProductoPort>;

  const createMockCarrito = (overrides?: Partial<Carrito>): Carrito => ({
    CarritoId: 1,
    UsuarioId: 1,
    Estado: 'Activo',
    Subtotal: 0,
    TotalDescuentos: 0,
    Total: 0,
    FechaCreacion: new Date(),
    FechaConversion: null,
    IsDeleted: false,
    items: [],
    cupones: [],
    ...overrides,
  } as Carrito);

  const createMockCarritoItem = (overrides?: Partial<CarritoItem>): CarritoItem => ({
    CarritoItemId: 1,
    CarritoId: 1,
    ProductoId: 10,
    Cantidad: 1,
    PrecioUnitario: 15000,
    Subtotal: 15000,
    IsDeleted: false,
    ...overrides,
  } as CarritoItem);

  const mockProducto = {
    productoId: 10,
    nombre: 'Pizza Margarita',
    precio: 15000,
    disponibilidad: 50,
  };

  beforeEach(async () => {
    const mockCarritoRepo = {
      findCarritoActivo: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      actualizarTotales: jest.fn(),
    };

    const mockCarritoItemRepo = {
      findByCarritoYProducto: jest.fn(),
      actualizarCantidad: jest.fn(),
      create: jest.fn(),
      sumTotalByCarrito: jest.fn(),
    };

    const mockProductoPort = {
      obtenerDatos: jest.fn(),
      validarStock: jest.fn(),
      validarExiste: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgregarItemUseCase,
        { provide: CarritoRepository, useValue: mockCarritoRepo },
        { provide: CarritoItemRepository, useValue: mockCarritoItemRepo },
        { provide: 'IProductoPort', useValue: mockProductoPort },
      ],
    }).compile();

    useCase = module.get<AgregarItemUseCase>(AgregarItemUseCase);
    carritoRepository = module.get(CarritoRepository);
    carritoItemRepository = module.get(CarritoItemRepository);
    productoPort = module.get('IProductoPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ejecutar', () => {
    const dto: AgregarItemDto = {
      ProductoId: 10,
      Cantidad: 2,
    };

    it('debería agregar un producto nuevo al carrito', async () => {
      const mockCarrito = createMockCarrito();
      
      productoPort.obtenerDatos.mockResolvedValue(mockProducto);
      productoPort.validarStock.mockResolvedValue(true);
      carritoRepository.findCarritoActivo.mockResolvedValue(mockCarrito);
      carritoItemRepository.findByCarritoYProducto.mockResolvedValue(null);
      carritoItemRepository.sumTotalByCarrito.mockResolvedValue(30000);
      carritoRepository.findById.mockResolvedValue(
        createMockCarrito({
          Subtotal: 30000,
          Total: 30000,
          items: [createMockCarritoItem()],
        })
      );

      const result = await useCase.ejecutar(1, dto);

      expect(productoPort.obtenerDatos).toHaveBeenCalledWith(dto.ProductoId);
      expect(productoPort.validarStock).toHaveBeenCalledWith(dto.ProductoId, dto.Cantidad);
      expect(carritoItemRepository.create).toHaveBeenCalledWith({
        CarritoId: mockCarrito.CarritoId,
        ProductoId: dto.ProductoId,
        Cantidad: dto.Cantidad,
        PrecioUnitario: mockProducto.precio,
        Subtotal: mockProducto.precio * dto.Cantidad,
      });
      expect(carritoRepository.actualizarTotales).toHaveBeenCalled();
      expect(result.message).toBe('Producto agregado al carrito');
      expect(result.carrito.total).toBe(30000);
    });

    it('debería crear un carrito nuevo si no existe', async () => {
      const nuevoCarrito = createMockCarrito();
      
      productoPort.obtenerDatos.mockResolvedValue(mockProducto);
      productoPort.validarStock.mockResolvedValue(true);
      carritoRepository.findCarritoActivo.mockResolvedValue(null);
      carritoRepository.create.mockResolvedValue(nuevoCarrito);
      carritoItemRepository.findByCarritoYProducto.mockResolvedValue(null);
      carritoItemRepository.sumTotalByCarrito.mockResolvedValue(30000);
      carritoRepository.findById.mockResolvedValue(
        createMockCarrito({ 
          Subtotal: 30000, 
          Total: 30000 
        })
      );

      await useCase.ejecutar(1, dto);

      expect(carritoRepository.create).toHaveBeenCalledWith({
        UsuarioId: 1,
        Estado: 'Activo',
      });
      expect(carritoItemRepository.create).toHaveBeenCalled();
    });

    it('debería actualizar cantidad si el producto ya existe en el carrito', async () => {
      const mockCarrito = createMockCarrito();
      const itemExistente = createMockCarritoItem({
        CarritoItemId: 5,
        Cantidad: 1,
        PrecioUnitario: 15000,
        Subtotal: 15000,
      });
      
      productoPort.obtenerDatos.mockResolvedValue(mockProducto);
      productoPort.validarStock.mockResolvedValue(true);
      carritoRepository.findCarritoActivo.mockResolvedValue(mockCarrito);
      carritoItemRepository.findByCarritoYProducto.mockResolvedValue(itemExistente);
      carritoItemRepository.sumTotalByCarrito.mockResolvedValue(45000);
      carritoRepository.findById.mockResolvedValue(
        createMockCarrito({
          Total: 45000,
        })
      );

      await useCase.ejecutar(1, dto);

      expect(carritoItemRepository.actualizarCantidad).toHaveBeenCalledWith(
        itemExistente.CarritoItemId,
        3, 
        45000, 
      );
      expect(carritoItemRepository.create).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el producto no existe', async () => {
      productoPort.obtenerDatos.mockResolvedValue(null);

      await expect(useCase.ejecutar(1, dto)).rejects.toThrow(
        new NotFoundException('Producto no encontrado'),
      );
      expect(productoPort.validarStock).not.toHaveBeenCalled();
      expect(carritoRepository.findCarritoActivo).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si no hay stock suficiente', async () => {
      productoPort.obtenerDatos.mockResolvedValue(mockProducto);
      productoPort.validarStock.mockResolvedValue(false);

      await expect(useCase.ejecutar(1, dto)).rejects.toThrow(
        new BadRequestException('Stock insuficiente'),
      );
      expect(carritoRepository.findCarritoActivo).not.toHaveBeenCalled();
    });
  });
});