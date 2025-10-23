import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../../auth/roles.guard';
import { Roles } from '../../../../auth/roles.decorator';
import { CrearPedidoDto } from '../../../Application/DTOs/crearpedido.dto';
import type{
  ICrearPedidoUseCase,
  IObtenerPedidoUseCase,
  IListarMisPedidosUseCase,
  IListarPedidosVendedorUseCase,
  ITomarPedidoUseCase,
  IEntregarPedidoUseCase,
  ICancelarPedidoUseCase,
} from '../../Ports/Inbound/pedidousecase.port';

@Controller('pedidos')
export class PedidoController {
  constructor(
    @Inject('ICrearPedidoUseCase')
    private readonly crearPedidoUseCase: ICrearPedidoUseCase,
    @Inject('IObtenerPedidoUseCase')
    private readonly obtenerPedidoUseCase: IObtenerPedidoUseCase,
    @Inject('IListarMisPedidosUseCase')
    private readonly listarMisPedidosUseCase: IListarMisPedidosUseCase,
    @Inject('IListarPedidosVendedorUseCase')
    private readonly listarPedidosVendedorUseCase: IListarPedidosVendedorUseCase,
    @Inject('ITomarPedidoUseCase')
    private readonly tomarPedidoUseCase: ITomarPedidoUseCase,
    @Inject('IEntregarPedidoUseCase')
    private readonly entregarPedidoUseCase: IEntregarPedidoUseCase,
    @Inject('ICancelarPedidoUseCase')
    private readonly cancelarPedidoUseCase: ICancelarPedidoUseCase,
  ) {}

  // ==========================================
  // ENDPOINTS PARA CLIENTES
  // ==========================================

  @Get('mis-pedidos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente')
  async listarMisPedidos(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.listarMisPedidosUseCase.ejecutar(req.user.usuarioId, page, limit);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente')
  @HttpCode(HttpStatus.CREATED)
  async crearPedido(@Body() crearPedidoDto: CrearPedidoDto, @Request() req) {
    return await this.crearPedidoUseCase.ejecutar(req.user.usuarioId, crearPedidoDto);
  }

  // ==========================================
  // ENDPOINTS PARA VENDEDORES
  // ==========================================

  @Get('vendedor/mis-pedidos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendedor')
  async listarPedidosVendedor(
    @Request() req,
    @Query('estado') estado?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.listarPedidosVendedorUseCase.ejecutar(req.user.usuarioId, estado, page, limit);
  }

  // ==========================================
  // ENDPOINTS PARA REPARTIDORES
  // ==========================================

  @Get('pendientes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('repartidor')
  async listarPedidosPendientes(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    // Este endpoint lista todos los pedidos pendientes sin filtrar por usuario
    // La lógica se implementará en el UseCase correspondiente
    return { message: 'Implementar listar pedidos pendientes' };
  }

  @Put(':id/tomar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('repartidor')
  @HttpCode(HttpStatus.OK)
  async tomarPedido(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return await this.tomarPedidoUseCase.ejecutar(id, req.user.usuarioId);
  }

  @Put(':id/entregar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('repartidor')
  @HttpCode(HttpStatus.OK)
  async entregarPedido(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return await this.entregarPedidoUseCase.ejecutar(id, req.user.usuarioId);
  }


  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente', 'vendedor', 'repartidor', 'admin')
  async obtenerPedido(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return await this.obtenerPedidoUseCase.ejecutar(id, req.user.usuarioId, req.user.rol);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente', 'admin')
  @HttpCode(HttpStatus.OK)
  async cancelarPedido(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return await this.cancelarPedidoUseCase.ejecutar(id, req.user.usuarioId, req.user.rol);
  }
}