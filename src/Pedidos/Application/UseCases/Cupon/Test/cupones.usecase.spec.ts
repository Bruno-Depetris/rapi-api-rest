import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CrearCuponUseCase } from '../crearcupon.usecase';
import { ActualizarCuponUseCase } from '../actualizarcupon.usecase';
import { EliminarCuponUseCase } from '../eliminarcupon.usecase';
import { ObtenerCuponUseCase } from '../obtenercupon.usecase';
import { ListarCuponesUseCase } from '../listarcupones.usecase';
import { ListarCuponesActivosUseCase } from '../listarcuponesactivos.usecase';
import { ValidarCuponUseCase } from '../validarcupon.usecase';
import { CuponRepository } from '../../../../Infrastructure/Persistence/cupon.repository';

describe('Cupones UseCases', () => {
    let cuponRepository: jest.Mocked<CuponRepository>;

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
        const mockRepo = {
            findById: jest.fn(),
            findByCodigo: jest.fn(),
            findAll: jest.fn(),
            findActivos: jest.fn(),
            existsByCodigo: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            count: jest.fn(),
        };

        cuponRepository = mockRepo as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('CrearCuponUseCase', () => {
        let useCase: CrearCuponUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    CrearCuponUseCase,
                    { provide: CuponRepository, useValue: cuponRepository },
                ],
            }).compile();
            useCase = module.get(CrearCuponUseCase);
        });

        it('debería crear un cupón exitosamente', async () => {
            cuponRepository.existsByCodigo.mockResolvedValue(false);
            cuponRepository.create.mockResolvedValue(mockCupon as any);

            const result = await useCase.ejecutar({
                Codigo: 'DESC20',
                Descuento: 20,
                TipoDescuento: 'porcentaje',
                FechaExpiracion: new Date('2026-12-31'),
                UsosMaximos: 100,
            });

            expect(result.message).toBe('Cupón creado exitosamente');
            expect(result.cupon.codigo).toBe('DESC20');
        });

        it('debería lanzar ConflictException si el código ya existe', async () => {
            cuponRepository.existsByCodigo.mockResolvedValue(true);

            await expect(useCase.ejecutar({ Codigo: 'DESC20' } as any)).rejects.toThrow(
                new ConflictException('Ya existe un cupón con ese código'),
            );
        });

        it('debería lanzar BadRequestException si porcentaje > 100', async () => {
            cuponRepository.existsByCodigo.mockResolvedValue(false);

            await expect(
                useCase.ejecutar({
                    Codigo: 'DESC150',
                    Descuento: 150,
                    TipoDescuento: 'porcentaje',
                } as any),
            ).rejects.toThrow(
                new BadRequestException('El descuento porcentual no puede ser mayor a 100'),
            );
        });
    });

    describe('ActualizarCuponUseCase', () => {
        let useCase: ActualizarCuponUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ActualizarCuponUseCase,
                    { provide: CuponRepository, useValue: cuponRepository },
                ],
            }).compile();
            useCase = module.get(ActualizarCuponUseCase);
        });

        it('debería actualizar un cupón exitosamente', async () => {
            const actualizado = { ...mockCupon, Descuento: 25 };
            cuponRepository.findById.mockResolvedValue(mockCupon as any);
            cuponRepository.update.mockResolvedValue(actualizado as any);

            const result = await useCase.ejecutar(1, { Descuento: 25 });

            expect(result.message).toBe('Cupón actualizado exitosamente');
            expect(result.cupon.descuento).toBe(25);
        });

        it('debería lanzar NotFoundException si no existe', async () => {
            cuponRepository.findById.mockResolvedValue(null);

            await expect(useCase.ejecutar(999, { Descuento: 25 })).rejects.toThrow(
                new NotFoundException('Cupón no encontrado'),
            );
        });

        it('debería lanzar ConflictException si nuevo código ya existe', async () => {
            cuponRepository.findById.mockResolvedValue(mockCupon as any);
            cuponRepository.existsByCodigo.mockResolvedValue(true);

            await expect(useCase.ejecutar(1, { Codigo: 'OTRO' })).rejects.toThrow(
                new ConflictException('Ya existe un cupón con ese código'),
            );
        });
    });

    describe('EliminarCuponUseCase', () => {
        let useCase: EliminarCuponUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    EliminarCuponUseCase,
                    { provide: CuponRepository, useValue: cuponRepository },
                ],
            }).compile();
            useCase = module.get(EliminarCuponUseCase);
        });

        it('debería eliminar un cupón exitosamente', async () => {
            cuponRepository.findById.mockResolvedValue(mockCupon as any);

            const result = await useCase.ejecutar(1);

            expect(cuponRepository.softDelete).toHaveBeenCalledWith(1);
            expect(result.message).toBe('Cupón eliminado exitosamente');
        });

        it('debería lanzar NotFoundException si no existe', async () => {
            cuponRepository.findById.mockResolvedValue(null);

            await expect(useCase.ejecutar(999)).rejects.toThrow(
                new NotFoundException('Cupón no encontrado'),
            );
        });
    });

    describe('ObtenerCuponUseCase', () => {
        let useCase: ObtenerCuponUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ObtenerCuponUseCase,
                    { provide: CuponRepository, useValue: cuponRepository },
                ],
            }).compile();
            useCase = module.get(ObtenerCuponUseCase);
        });

        it('debería obtener un cupón por ID', async () => {
            cuponRepository.findById.mockResolvedValue(mockCupon as any);

            const result = await useCase.ejecutar(1);

            expect(result.codigo).toBe('DESC20');
            expect(result.descuento).toBe(20);
        });

        it('debería lanzar NotFoundException si no existe', async () => {
            cuponRepository.findById.mockResolvedValue(null);

            await expect(useCase.ejecutar(999)).rejects.toThrow(
                new NotFoundException('Cupón no encontrado'),
            );
        });
    });

    describe('ListarCuponesUseCase', () => {
        let useCase: ListarCuponesUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ListarCuponesUseCase,
                    { provide: CuponRepository, useValue: cuponRepository },
                ],
            }).compile();
            useCase = module.get(ListarCuponesUseCase);
        });

        it('debería listar cupones con paginación', async () => {
            cuponRepository.findAll.mockResolvedValue([mockCupon] as any);
            cuponRepository.count.mockResolvedValue(1);

            const result = await useCase.ejecutar(1, 10);

            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
            expect(result.totalPages).toBe(1);
        });
    });

    describe('ListarCuponesActivosUseCase', () => {
        let useCase: ListarCuponesActivosUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ListarCuponesActivosUseCase,
                    { provide: CuponRepository, useValue: cuponRepository },
                ],
            }).compile();
            useCase = module.get(ListarCuponesActivosUseCase);
        });

        it('debería listar solo cupones activos', async () => {
            cuponRepository.findActivos.mockResolvedValue([mockCupon] as any);

            const result = await useCase.ejecutar();

            expect(result).toHaveLength(1);
            expect(result[0].codigo).toBe('DESC20');
        });
    });

    describe('ValidarCuponUseCase', () => {
        let useCase: ValidarCuponUseCase;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ValidarCuponUseCase,
                    { provide: CuponRepository, useValue: cuponRepository },
                ],
            }).compile();
            useCase = module.get(ValidarCuponUseCase);
        });

        it('debería validar un cupón correctamente', async () => {
            cuponRepository.findByCodigo.mockResolvedValue(mockCupon as any);

            const result = await useCase.ejecutar('DESC20');

            expect(result.valido).toBe(true);
            expect(result.cupon?.codigo).toBe('DESC20');
        });

        it('debería retornar inválido si el cupón no existe', async () => {
            cuponRepository.findByCodigo.mockResolvedValue(null);

            const result = await useCase.ejecutar('FAKE');

            expect(result.valido).toBe(false);
            expect(result.mensaje).toBe('Cupón no encontrado');
        });

        it('debería retornar inválido si el cupón está vencido', async () => {
            const cuponVencido = { ...mockCupon, FechaExpiracion: new Date('2020-01-01') };
            cuponRepository.findByCodigo.mockResolvedValue(cuponVencido as any);

            const result = await useCase.ejecutar('DESC20');

            expect(result.valido).toBe(false);
            expect(result.mensaje).toBe('El cupón ha expirado');
        });

        it('debería retornar inválido si alcanzó el límite de usos', async () => {
            const cuponAgotado = { ...mockCupon, UsosMaximos: 10, UsosActuales: 10 };
            cuponRepository.findByCodigo.mockResolvedValue(cuponAgotado as any);

            const result = await useCase.ejecutar('DESC20');

            expect(result.valido).toBe(false);
            expect(result.mensaje).toBe('El cupón ha alcanzado su límite de usos');
        });
    });
});