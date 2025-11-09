import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TomarPedidoUseCase } from '../tomarpedido.usecase';
import { PedidoRepository } from '../../../../Infrastructure/Persistence/pedido.repository';
import { IRepartidorPort } from '../../../../Infrastructure/Ports/Outbound/repartidor.port';

describe('TomarPedidoUseCase', () => {
    let useCase: TomarPedidoUseCase;
    let pedidoRepository: jest.Mocked<PedidoRepository>;
    let repartidorPort: jest.Mocked<IRepartidorPort>;

    const mockRepartidor = {
        repartidorId: 10,
        vehiculo: 'Moto',
    };

    const mockPedido = {
        PedidoId: 100,
        UsuarioId: 1,
        Estado: 'Pendiente',
        RepartidorId: null,
        Total: 50000,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TomarPedidoUseCase,
                {
                    provide: PedidoRepository,
                    useValue: {
                        findById: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: 'IRepartidorPort',
                    useValue: {
                        obtenerPorUsuarioId: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get<TomarPedidoUseCase>(TomarPedidoUseCase);
        pedidoRepository = module.get(PedidoRepository);
        repartidorPort = module.get('IRepartidorPort');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debería permitir que un repartidor tome un pedido pendiente', async () => {
        // Arrange
        repartidorPort.obtenerPorUsuarioId.mockResolvedValue(mockRepartidor);
        pedidoRepository.findById.mockResolvedValue(mockPedido as any);

        // Act
        const result = await useCase.ejecutar(100, 5);

        // Assert
        expect(repartidorPort.obtenerPorUsuarioId).toHaveBeenCalledWith(5);
        expect(pedidoRepository.findById).toHaveBeenCalledWith(100);
        expect(pedidoRepository.update).toHaveBeenCalledWith(100, {
            RepartidorId: 10,
            Estado: 'EnCamino',
        });
        expect(result.message).toBe('Pedido tomado exitosamente');
        expect(result.pedido.estado).toBe('EnCamino');
    });

    it('debería lanzar NotFoundException si el usuario no es repartidor', async () => {
        // Arrange
        repartidorPort.obtenerPorUsuarioId.mockResolvedValue(null);

        // Act & Assert
        await expect(useCase.ejecutar(100, 5)).rejects.toThrow(
            new NotFoundException('No eres repartidor'),
        );
        expect(pedidoRepository.findById).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el pedido no existe', async () => {
        // Arrange
        repartidorPort.obtenerPorUsuarioId.mockResolvedValue(mockRepartidor);
        pedidoRepository.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(useCase.ejecutar(100, 5)).rejects.toThrow(
            new NotFoundException('Pedido no encontrado'),
        );
    });

    it('debería lanzar BadRequestException si el pedido no está pendiente', async () => {
        // Arrange
        repartidorPort.obtenerPorUsuarioId.mockResolvedValue(mockRepartidor);
        pedidoRepository.findById.mockResolvedValue({
            ...mockPedido,
            Estado: 'EnCamino',
        } as any);

        // Act & Assert
        await expect(useCase.ejecutar(100, 5)).rejects.toThrow(
            new BadRequestException('Este pedido ya no está disponible'),
        );
    });

    it('debería lanzar BadRequestException si el pedido ya tiene repartidor', async () => {
        // Arrange
        repartidorPort.obtenerPorUsuarioId.mockResolvedValue(mockRepartidor);
        pedidoRepository.findById.mockResolvedValue({
            ...mockPedido,
            RepartidorId: 999,
        } as any);

        // Act & Assert
        await expect(useCase.ejecutar(100, 5)).rejects.toThrow(
            new BadRequestException('Este pedido ya fue tomado por otro repartidor'),
        );
    });
});