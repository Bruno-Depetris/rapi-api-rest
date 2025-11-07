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
import { CategoriasService } from '../Services/categoria.service';
import { CrearCategoriaDto } from '../DTOs/crearcategoria.dto';
import { ActualizarCategoriaDto } from '../DTOs/actualizarcategoria.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  async listarCategorias() {
    return await this.categoriasService.listarCategorias();
  }

  @Get(':id')
  async obtenerCategoria(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriasService.obtenerCategoria(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async crearCategoria(@Body() crearDto: CrearCategoriaDto) {
    return await this.categoriasService.crearCategoria(crearDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async actualizarCategoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarDto: ActualizarCategoriaDto,
  ) {
    return await this.categoriasService.actualizarCategoria(id, actualizarDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async eliminarCategoria(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriasService.eliminarCategoria(id);
  }
}