import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
import { AgregarItemDto } from '../../../Application/DTOs/agregaritem.dto';
import { ActualizarItemDto } from '../../../Application/DTOs/actualizarcarrito.dto';
import { AplicarCuponDto } from '../../../Application/DTOs/aplicarcupon.dto';
import type {
  IObtenerCarritoUseCase,
  IAgregarItemUseCase,
  IActualizarItemUseCase,
  IEliminarItemUseCase,
  IVaciarCarritoUseCase,
  IAplicarCuponUseCase,
  IRemoverCuponUseCase,
} from '../../Ports/Inbound/carritoUseCase.port';

@Controller('carrito')
export class CarritoController {
  constructor(
    @Inject('IObtenerCarritoUseCase')
    private readonly obtenerCarritoUseCase: IObtenerCarritoUseCase,
    @Inject('IAgregarItemUseCase')
    private readonly agregarItemUseCase: IAgregarItemUseCase,
    @Inject('IActualizarItemUseCase')
    private readonly actualizarItemUseCase: IActualizarItemUseCase,
    @Inject('IEliminarItemUseCase')
    private readonly eliminarItemUseCase: IEliminarItemUseCase,
    @Inject('IVaciarCarritoUseCase')
    private readonly vaciarCarritoUseCase: IVaciarCarritoUseCase,
    @Inject('IAplicarCuponUseCase')
    private readonly aplicarCuponUseCase: IAplicarCuponUseCase,
    @Inject('IRemoverCuponUseCase')
    private readonly removerCuponUseCase: IRemoverCuponUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente')
  async obtenerCarritoActivo(@Request() req) {
    return await this.obtenerCarritoUseCase.ejecutar(req.user.usuarioId);
  }

  @Post('items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente')
  @HttpCode(HttpStatus.CREATED)
  async agregarItem(@Body() agregarItemDto: AgregarItemDto, @Request() req) {
    return await this.agregarItemUseCase.ejecutar(req.user.usuarioId, agregarItemDto);
  }

  @Put('items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente')
  @HttpCode(HttpStatus.OK)
  async actualizarItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarItemDto: ActualizarItemDto,
    @Request() req,
  ) {
    return await this.actualizarItemUseCase.ejecutar(req.user.usuarioId, id, actualizarItemDto);
  }

  @Delete('items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente')
  @HttpCode(HttpStatus.OK)
  async eliminarItem(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return await this.eliminarItemUseCase.ejecutar(req.user.usuarioId, id);
  }

  @Delete('vaciar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente')
  @HttpCode(HttpStatus.OK)
  async vaciarCarrito(@Request() req) {
    return await this.vaciarCarritoUseCase.ejecutar(req.user.usuarioId);
  }

  @Post('cupones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente')
  @HttpCode(HttpStatus.CREATED)
  async aplicarCupon(@Body() aplicarCuponDto: AplicarCuponDto, @Request() req) {
    return await this.aplicarCuponUseCase.ejecutar(req.user.usuarioId, aplicarCuponDto);
  }

  @Delete('cupones/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente')
  @HttpCode(HttpStatus.OK)
  async removerCupon(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return await this.removerCuponUseCase.ejecutar(req.user.usuarioId, id);
  }
}