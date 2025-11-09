import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CrearMetodoPagoUseCase } from '../crearmetodopago.usecase';
import { ActualizarMetodoPagoUseCase } from '../actualizarmetodopago.usecase';
import { EliminarMetodoPagoUseCase } from '../eliminarmetodopago.usecase';
import { ObtenerMetodoPagoUseCase } from '../obtenermetodopago.usecase';
import { ListarMetodosPagoUseCase } from '../listarmetodopago.usecase';
import { MetodoPagoRepository } from '../../../../Infrastructure/Persistence/metodopago.repository';

describe('Métodos de Pago UseCases', () => {
    let metodoPagoRepository: jest.Mocked<MetodoPagoRepository>;

    const mockMetodoPago = {
        MetodoId: 1,
        Metodo: 'Efectivo',
        IsDeleted: false,
    };

    beforeEach(() => {
        metodoPagoRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByNombre: jest.fn(),
            existsByNombre: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
        } as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ==================== CREAR MÉTODO DE PAGO ====================
    describe('CrearMetodoPagoUseCase', () => {
        let useCase: CrearMetodoPagoUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    CrearMetodoPagoUseCase,
                    { provide: MetodoPagoRepository, useValue: metodoPagoRepository },
                ],
            }).compile();
            useCase = module.get(CrearMetodoPagoUseCase);
        });

        it('debería crear un método de pago exitosamente', async () => {
            metodoPagoRepository.existsByNombre.mockResolvedValue(false);
            metodoPagoRepository.create.mockResolvedValue(mockMetodoPago as any);

            const result = await useCase.ejecutar({ Metodo: 'Efectivo' });

            expect(metodoPagoRepository.existsByNombre).toHaveBeenCalledWith('Efectivo');
            expect(metodoPagoRepository.create).toHaveBeenCalledWith({ Metodo: 'Efectivo' });
            expect(result.message).toBe('Método de pago creado exitosamente');
            expect(result.metodoPago.metodo).toBe('Efectivo');
        });

        it('debería lanzar ConflictException si el método ya existe', async () => {
            metodoPagoRepository.existsByNombre.mockResolvedValue(true);

            await expect(useCase.ejecutar({ Metodo: 'Efectivo' })).rejects.toThrow(
                new ConflictException('Ya existe un método de pago con ese nombre'),
            );
            expect(metodoPagoRepository.create).not.toHaveBeenCalled();
        });
    });

    // ==================== ACTUALIZAR MÉTODO DE PAGO ====================
    describe('ActualizarMetodoPagoUseCase', () => {
        let useCase: ActualizarMetodoPagoUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ActualizarMetodoPagoUseCase,
                    { provide: MetodoPagoRepository, useValue: metodoPagoRepository },
                ],
            }).compile();
            useCase = module.get(ActualizarMetodoPagoUseCase);
        });

        it('debería actualizar un método de pago exitosamente', async () => {
            const actualizado = { ...mockMetodoPago, Metodo: 'Tarjeta de Crédito' };
            metodoPagoRepository.findById.mockResolvedValue(mockMetodoPago as any);
            metodoPagoRepository.findByNombre.mockResolvedValue(null);
            metodoPagoRepository.update.mockResolvedValue(actualizado as any);

            const result = await useCase.ejecutar(1, { Metodo: 'Tarjeta de Crédito' });

            expect(metodoPagoRepository.findById).toHaveBeenCalledWith(1);
            expect(metodoPagoRepository.update).toHaveBeenCalledWith(1, { Metodo: 'Tarjeta de Crédito' });
            expect(result.message).toBe('Método de pago actualizado exitosamente');
            expect(result.metodoPago.metodo).toBe('Tarjeta de Crédito');
        });

        it('debería lanzar NotFoundException si el método no existe', async () => {
            metodoPagoRepository.findById.mockResolvedValue(null);

            await expect(useCase.ejecutar(999, { Metodo: 'Nuevo' })).rejects.toThrow(
                new NotFoundException('Método de pago no encontrado'),
            );
        });

        it('debería lanzar ConflictException si el nuevo nombre ya existe', async () => {
            const otroMetodo = { MetodoId: 2, Metodo: 'Tarjeta' };
            metodoPagoRepository.findById.mockResolvedValue(mockMetodoPago as any);
            metodoPagoRepository.findByNombre.mockResolvedValue(otroMetodo as any);

            await expect(useCase.ejecutar(1, { Metodo: 'Tarjeta' })).rejects.toThrow(
                new ConflictException('Ya existe un método de pago con ese nombre'),
            );
        });

        it('debería permitir actualizar sin cambiar el nombre', async () => {
            metodoPagoRepository.findById.mockResolvedValue(mockMetodoPago as any);
            metodoPagoRepository.update.mockResolvedValue(mockMetodoPago as any);

            const result = await useCase.ejecutar(1, {});

            expect(metodoPagoRepository.findByNombre).not.toHaveBeenCalled();
            expect(result.message).toBe('Método de pago actualizado exitosamente');
        });
    });

    // ==================== ELIMINAR MÉTODO DE PAGO ====================
    describe('EliminarMetodoPagoUseCase', () => {
        let useCase: EliminarMetodoPagoUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    EliminarMetodoPagoUseCase,
                    { provide: MetodoPagoRepository, useValue: metodoPagoRepository },
                ],
            }).compile();
            useCase = module.get(EliminarMetodoPagoUseCase);
        });

        it('debería eliminar un método de pago exitosamente', async () => {
            metodoPagoRepository.findById.mockResolvedValue(mockMetodoPago as any);

            const result = await useCase.ejecutar(1);

            expect(metodoPagoRepository.findById).toHaveBeenCalledWith(1);
            expect(metodoPagoRepository.softDelete).toHaveBeenCalledWith(1);
            expect(result.message).toBe('Método de pago eliminado exitosamente');
        });

        it('debería lanzar NotFoundException si el método no existe', async () => {
            metodoPagoRepository.findById.mockResolvedValue(null);

            await expect(useCase.ejecutar(999)).rejects.toThrow(
                new NotFoundException('Método de pago no encontrado'),
            );
            expect(metodoPagoRepository.softDelete).not.toHaveBeenCalled();
        });
    });

    // ==================== OBTENER MÉTODO DE PAGO ====================
    describe('ObtenerMetodoPagoUseCase', () => {
        let useCase: ObtenerMetodoPagoUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ObtenerMetodoPagoUseCase,
                    { provide: MetodoPagoRepository, useValue: metodoPagoRepository },
                ],
            }).compile();
            useCase = module.get(ObtenerMetodoPagoUseCase);
        });

        it('debería obtener un método de pago por ID', async () => {
            metodoPagoRepository.findById.mockResolvedValue(mockMetodoPago as any);

            const result = await useCase.ejecutar(1);

            expect(metodoPagoRepository.findById).toHaveBeenCalledWith(1);
            expect(result.metodoId).toBe(1);
            expect(result.metodo).toBe('Efectivo');
        });

        it('debería lanzar NotFoundException si el método no existe', async () => {
            metodoPagoRepository.findById.mockResolvedValue(null);

            await expect(useCase.ejecutar(999)).rejects.toThrow(
                new NotFoundException('Método de pago no encontrado'),
            );
        });
    });

    // ==================== LISTAR MÉTODOS DE PAGO ====================
    describe('ListarMetodosPagoUseCase', () => {
        let useCase: ListarMetodosPagoUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ListarMetodosPagoUseCase,
                    { provide: MetodoPagoRepository, useValue: metodoPagoRepository },
                ],
            }).compile();
            useCase = module.get(ListarMetodosPagoUseCase);
        });

        it('debería listar todos los métodos de pago', async () => {
            const metodos = [
                mockMetodoPago,
                { MetodoId: 2, Metodo: 'Tarjeta de Crédito' },
                { MetodoId: 3, Metodo: 'Tarjeta de Débito' },
            ];
            metodoPagoRepository.findAll.mockResolvedValue(metodos as any);

            const result = await useCase.ejecutar();

            expect(metodoPagoRepository.findAll).toHaveBeenCalled();
            expect(result).toHaveLength(3);
            expect(result[0].metodo).toBe('Efectivo');
            expect(result[1].metodo).toBe('Tarjeta de Crédito');
        });

        it('debería retornar array vacío si no hay métodos', async () => {
            metodoPagoRepository.findAll.mockResolvedValue([]);

            const result = await useCase.ejecutar();

            expect(result).toHaveLength(0);
        });
    });
});
