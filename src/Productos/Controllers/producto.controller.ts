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
} from '@nestjs/common';
import { ProductosService } from '../Services/producto.service';
import { CrearProductoDto } from '../DTOs/crearproducto.dto';
import { ActualizarProductoDto } from '../DTOs/actualizarproducto.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  async listarProductos() {
    return await this.productosService.listarProductos();
  }

  @Get('mis-productos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendedor')
  async obtenerMisProductos(@Request() req) {
    return await this.productosService.obtenerMisProductos(req.user.usuarioId);
  }

  @Get(':id')
  async obtenerProducto(@Param('id', ParseIntPipe) id: number) {
    return await this.productosService.obtenerProducto(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendedor')
  @HttpCode(HttpStatus.CREATED)
  async crearProducto(@Body() crearDto: CrearProductoDto, @Request() req) {
    return await this.productosService.crearProducto(req.user.usuarioId, crearDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendedor')
  @HttpCode(HttpStatus.OK)
  async actualizarProducto(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarDto: ActualizarProductoDto,
    @Request() req,
  ) {
    return await this.productosService.actualizarProducto(req.user.usuarioId, id, actualizarDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendedor', 'admin')
  @HttpCode(HttpStatus.OK)
  async eliminarProducto(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return await this.productosService.eliminarProducto(req.user.usuarioId, id, req.user.rol);
  }
}