import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../../auth/roles.guard';
import { Roles } from '../../../../auth/roles.decorator';
import { CrearMetodoPagoDto } from '../../../Application/DTOs/crearmetodopago.dto';
import { ActualizarMetodoPagoDto } from '../../../Application/DTOs/actualizarmetodopago.dto';
import type {
  ICrearMetodoPagoUseCase,
  IObtenerMetodoPagoUseCase,
  IListarMetodosPagoUseCase,
  IActualizarMetodoPagoUseCase,
  IEliminarMetodoPagoUseCase,
} from '../../Ports/Inbound/metodopagoUseCase.port';

@Controller('metodos-pago')
export class MetodoPagoController {
  constructor(
    @Inject('ICrearMetodoPagoUseCase')
    private readonly crearMetodoPagoUseCase: ICrearMetodoPagoUseCase,
    @Inject('IObtenerMetodoPagoUseCase')
    private readonly obtenerMetodoPagoUseCase: IObtenerMetodoPagoUseCase,
    @Inject('IListarMetodosPagoUseCase')
    private readonly listarMetodosPagoUseCase: IListarMetodosPagoUseCase,
    @Inject('IActualizarMetodoPagoUseCase')
    private readonly actualizarMetodoPagoUseCase: IActualizarMetodoPagoUseCase,
    @Inject('IEliminarMetodoPagoUseCase')
    private readonly eliminarMetodoPagoUseCase: IEliminarMetodoPagoUseCase,
  ) {}

  @Get()
  async listarMetodosPago() {
    return await this.listarMetodosPagoUseCase.ejecutar();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async obtenerMetodoPago(@Param('id', ParseIntPipe) id: number) {
    return await this.obtenerMetodoPagoUseCase.ejecutar(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async crearMetodoPago(@Body() crearMetodoPagoDto: CrearMetodoPagoDto) {
    return await this.crearMetodoPagoUseCase.ejecutar(crearMetodoPagoDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async actualizarMetodoPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarMetodoPagoDto: ActualizarMetodoPagoDto,
  ) {
    return await this.actualizarMetodoPagoUseCase.ejecutar(id, actualizarMetodoPagoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async eliminarMetodoPago(@Param('id', ParseIntPipe) id: number) {
    return await this.eliminarMetodoPagoUseCase.ejecutar(id);
  }
}