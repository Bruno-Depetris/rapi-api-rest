import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EntregarPedidoUseCase } from '../entregarpedido.usecase';
import { PedidoRepository } from '../../../../Infrastructure/Persistence/pedido.repository';
import { IRepartidorPort } from '../../../../Infrastructure/Ports/Outbound/repartidor.port';

describe('EntregarPedidoUseCase', () => {
    let useCase: EntregarPedidoUseCase;
    let pedidoRepository: jest.Mocked<PedidoRepository>;
    let repartidorPort: jest.Mocked<IRepartidorPort>;

    const mockRepartidor = {
        repartidorId: 10,
        vehiculo: 'Moto',
    };

    const mockPedido = {
        PedidoId: 100,
        UsuarioId: 1,
        Estado: 'EnCamino',
        RepartidorId: 10,
        Total: 50000,
        FechaEntrega: null,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EntregarPedidoUseCase,
                {
                    provide: PedidoRepository,
                    useValue: {
                        findById: jest.fn(),
                        marcarEntregado: jest.fn(),
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

        useCase = module.get<EntregarPedidoUseCase>(EntregarPedidoUseCase);
        pedidoRepository = module.get(PedidoRepository);
        repartidorPort = module.get('IRepartidorPort');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debería marcar un pedido como entregado exitosamente', async () => {
        // Arrange
        repartidorPort.obtenerPorUsuarioId.mockResolvedValue(mockRepartidor);
        pedidoRepository.findById
            .mockResolvedValueOnce(mockPedido as any)
            .mockResolvedValueOnce({
                ...mockPedido,
                Estado: 'Entregado',
                FechaEntrega: new Date(),
            } as any);

        // Act
        const result = await useCase.ejecutar(100, 5);

        // Assert
        expect(repartidorPort.obtenerPorUsuarioId).toHaveBeenCalledWith(5);
        expect(pedidoRepository.findById).toHaveBeenCalledWith(100);
        expect(pedidoRepository.marcarEntregado).toHaveBeenCalledWith(100);
        expect(result.message).toBe('Pedido marcado como entregado');
        expect(result.pedido.estado).toBe('Entregado');
        expect(result.pedido.fechaEntrega).toBeDefined();
    });

    it('debería lanzar NotFoundException si el usuario no es repartidor', async () => {
        // Arrange
        repartidorPort.obtenerPorUsuarioId.mockResolvedValue(null);

        // Act & Assert
        await expect(useCase.ejecutar(100, 5)).rejects.toThrow(
            new NotFoundException('No eres repartidor'),
        );
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

    it('debería lanzar ForbiddenException si el pedido no pertenece al repartidor', async () => {
        // Arrange
        repartidorPort.obtenerPorUsuarioId.mockResolvedValue(mockRepartidor);
        pedidoRepository.findById.mockResolvedValue({
            ...mockPedido,
            RepartidorId: 999,
        } as any);

        // Act & Assert
        await expect(useCase.ejecutar(100, 5)).rejects.toThrow(
            new ForbiddenException('Este pedido no te pertenece'),
        );
    });

    it('debería lanzar BadRequestException si el pedido ya está entregado', async () => {
        // Arrange
        repartidorPort.obtenerPorUsuarioId.mockResolvedValue(mockRepartidor);
        pedidoRepository.findById.mockResolvedValue({
            ...mockPedido,
            Estado: 'Entregado',
        } as any);

        // Act & Assert
        await expect(useCase.ejecutar(100, 5)).rejects.toThrow(
            new BadRequestException('El pedido ya fue entregado'),
        );
    });
});