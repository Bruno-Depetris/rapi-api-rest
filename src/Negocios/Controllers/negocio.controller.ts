import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NegociosService } from '../Services/negocio.service';
import { ActualizarNegocioDto } from '../DTOs/actualizarnegocio.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('negocios')
export class NegociosController {
  constructor(private readonly negociosService: NegociosService) {}

  @Get()
  async listarNegocios(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.negociosService.listarNegocios(page, limit);
  }

  @Get('search')
  async buscarNegocios(
    @Query('q') termino: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.negociosService.buscarNegocios(termino, page, limit);
  }

  @Get('mi-negocio')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendedor')
  async obtenerMiNegocio(@Request() req) {
    return await this.negociosService.obtenerMiNegocio(req.user.usuarioId);
  }

  @Get('categoria/:categoriaId')
  async listarPorCategoria(@Param('categoriaId', ParseIntPipe) categoriaId: number) {
    return await this.negociosService.listarPorCategoria(categoriaId);
  }

  @Get(':id')
  async obtenerNegocio(@Param('id', ParseIntPipe) id: number) {
    return await this.negociosService.obtenerNegocio(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendedor')
  @HttpCode(HttpStatus.OK)
  async actualizarNegocio(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() actualizarDto: ActualizarNegocioDto,
  ) {
    return await this.negociosService.actualizarNegocio(
      id,
      req.user.usuarioId,
      req.user.rol,
      actualizarDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendedor', 'admin')
  @HttpCode(HttpStatus.OK)
  async eliminarNegocio(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return await this.negociosService.eliminarNegocio(
      id,
      req.user.usuarioId,
      req.user.rol,
    );
  }
}