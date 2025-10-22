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
} from '@nestjs/common';
import { CategoriasProductosService } from '../Services/categoriaproducto.service';
import { CrearCategoriaProductoDto } from '../DTOs/crearcategoria.dto';
import { ActualizarCategoriaProductoDto } from '../DTOs/actualizarcategoria.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('categorias-productos')
export class CategoriasProductosController {
  constructor(private readonly categoriasProductosService: CategoriasProductosService) {}

  @Get()
  async listarCategorias() {
    return await this.categoriasProductosService.listarCategorias();
  }

  @Get(':id')
  async obtenerCategoria(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriasProductosService.obtenerCategoria(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async crearCategoria(@Body() crearDto: CrearCategoriaProductoDto) {
    return await this.categoriasProductosService.crearCategoria(crearDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async actualizarCategoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarDto: ActualizarCategoriaProductoDto,
  ) {
    return await this.categoriasProductosService.actualizarCategoria(id, actualizarDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async eliminarCategoria(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriasProductosService.eliminarCategoria(id);
  }
}