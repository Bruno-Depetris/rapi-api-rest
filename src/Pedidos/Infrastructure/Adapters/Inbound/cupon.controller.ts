import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../../auth/roles.guard';
import { Roles } from '../../../../auth/roles.decorator';
import { CrearCuponDto } from '../../../Application/DTOs/crearcupon.dto';
import { ActualizarCuponDto } from '../../../Application/DTOs/actualizarcupon.dto';
import type {
  ICrearCuponUseCase,
  IObtenerCuponUseCase,
  IListarCuponesActivosUseCase,
  IListarCuponesUseCase,
  IActualizarCuponUseCase,
  IEliminarCuponUseCase,
  IValidarCuponUseCase,
} from '../../Ports/Inbound/cuponusecase.port';

@Controller('cupones')
export class CuponController {
  constructor(
    @Inject('ICrearCuponUseCase')
    private readonly crearCuponUseCase: ICrearCuponUseCase,
    @Inject('IObtenerCuponUseCase')
    private readonly obtenerCuponUseCase: IObtenerCuponUseCase,
    @Inject('IListarCuponesActivosUseCase')
    private readonly listarCuponesActivosUseCase: IListarCuponesActivosUseCase,
    @Inject('IListarCuponesUseCase')
    private readonly listarCuponesUseCase: IListarCuponesUseCase,
    @Inject('IActualizarCuponUseCase')
    private readonly actualizarCuponUseCase: IActualizarCuponUseCase,
    @Inject('IEliminarCuponUseCase')
    private readonly eliminarCuponUseCase: IEliminarCuponUseCase,
    @Inject('IValidarCuponUseCase')
    private readonly validarCuponUseCase: IValidarCuponUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async listarCupones(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return await this.listarCuponesUseCase.ejecutar(page, limit);
  }

  @Get('activos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente', 'admin')
  async listarCuponesActivos() {
    return await this.listarCuponesActivosUseCase.ejecutar();
  }

  @Get('validar/:codigo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente')
  async validarCupon(@Param('codigo') codigo: string) {
    return await this.validarCuponUseCase.ejecutar(codigo);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async obtenerCupon(@Param('id', ParseIntPipe) id: number) {
    return await this.obtenerCuponUseCase.ejecutar(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async crearCupon(@Body() crearCuponDto: CrearCuponDto) {
    return await this.crearCuponUseCase.ejecutar(crearCuponDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async actualizarCupon(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarCuponDto: ActualizarCuponDto,
  ) {
    return await this.actualizarCuponUseCase.ejecutar(id, actualizarCuponDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async eliminarCupon(@Param('id', ParseIntPipe) id: number) {
    return await this.eliminarCuponUseCase.ejecutar(id);
  }
}