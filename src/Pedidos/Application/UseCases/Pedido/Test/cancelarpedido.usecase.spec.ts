import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CancelarPedidoUseCase } from '../cancelarpedido.usecase';
import { PedidoRepository } from '../../../../Infrastructure/Persistence/pedido.repository';

describe('CancelarPedidoUseCase', () => {
    let useCase: CancelarPedidoUseCase;
    let pedidoRepository: jest.Mocked<PedidoRepository>;

    const mockPedido = {
        PedidoId: 100,
        UsuarioId: 1,
        Estado: 'Pendiente',
        Total: 50000,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CancelarPedidoUseCase,
                {
                    provide: PedidoRepository,
                    useValue: {
                        findById: jest.fn(),
                        actualizarEstado: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get<CancelarPedidoUseCase>(CancelarPedidoUseCase);
        pedidoRepository = module.get(PedidoRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debería cancelar un pedido exitosamente como cliente', async () => {
        
        pedidoRepository.findById.mockResolvedValue(mockPedido as any);

        const result = await useCase.ejecutar(100, 1, 'cliente');

        expect(pedidoRepository.findById).toHaveBeenCalledWith(100);
        expect(pedidoRepository.actualizarEstado).toHaveBeenCalledWith(100, 'Cancelado');
        expect(result.message).toBe('Pedido cancelado exitosamente');
    });

    it('debería cancelar un pedido exitosamente como admin', async () => {
        
        const pedidoDeOtroUsuario = { ...mockPedido, UsuarioId: 999 };
        pedidoRepository.findById.mockResolvedValue(pedidoDeOtroUsuario as any);

        const result = await useCase.ejecutar(100, 5, 'admin');

        expect(pedidoRepository.actualizarEstado).toHaveBeenCalledWith(100, 'Cancelado');
        expect(result.message).toBe('Pedido cancelado exitosamente');
    });

    it('debería lanzar NotFoundException si el pedido no existe', async () => {
        pedidoRepository.findById.mockResolvedValue(null);

        await expect(useCase.ejecutar(100, 1, 'cliente')).rejects.toThrow(
            new NotFoundException('Pedido no encontrado'),
        );
    });

    it('debería lanzar ForbiddenException si no es el dueño del pedido', async () => {
        const pedidoDeOtroUsuario = { ...mockPedido, UsuarioId: 999 };
        pedidoRepository.findById.mockResolvedValue(pedidoDeOtroUsuario as any);

        await expect(useCase.ejecutar(100, 1, 'cliente')).rejects.toThrow(
            new ForbiddenException('No tienes permiso para cancelar este pedido'),
        );
    });

    it('debería lanzar BadRequestException si el pedido está en camino', async () => {
        pedidoRepository.findById.mockResolvedValue({
            ...mockPedido,
            Estado: 'EnCamino',
        } as any);

        await expect(useCase.ejecutar(100, 1, 'cliente')).rejects.toThrow(
            new BadRequestException('No puedes cancelar un pedido en camino o entregado'),
        );
    });

    it('debería lanzar BadRequestException si el pedido está entregado', async () => {
        pedidoRepository.findById.mockResolvedValue({
            ...mockPedido,
            Estado: 'Entregado',
        } as any);

        await expect(useCase.ejecutar(100, 1, 'cliente')).rejects.toThrow(
            new BadRequestException('No puedes cancelar un pedido en camino o entregado'),
        );
    });
});