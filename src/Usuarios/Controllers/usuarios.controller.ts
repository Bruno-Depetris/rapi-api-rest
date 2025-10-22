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
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { UsuariosService } from '../Services/usuarios.service';
import { CambiarAVendedorDto } from '../DTOs/crearVendedor.dto';
import { CrearRepartidorDto } from '../DTOs/crearRepartidor.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('perfil')
  async obtenerPerfil(@Request() req) {
    return await this.usuariosService.obtenerPerfil(req.user.usuarioId);
  }

  @Put('cambiar-a-vendedor')
  @UseGuards(RolesGuard)
  @Roles('cliente')
  @HttpCode(HttpStatus.OK)
  async cambiarAVendedor(
    @Request() req,
    @Body() cambiarDto: CambiarAVendedorDto,
  ) {
    return await this.usuariosService.cambiarAVendedor(
      req.user.usuarioId,
      cambiarDto,
    );
  }

  @Put('cambiar-a-repartidor')
  @UseGuards(RolesGuard)
  @Roles('cliente')
  @HttpCode(HttpStatus.OK)
  async cambiarARepartidor(
    @Request() req,
    @Body() crearDto: CrearRepartidorDto,
  ) {
    return await this.usuariosService.cambiarARepartidor(
      req.user.usuarioId,
      crearDto,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async listarUsuarios(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.usuariosService.listarUsuarios(page, limit);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async eliminarUsuario(@Param('id', ParseIntPipe) id: number) {
    return await this.usuariosService.eliminarUsuario(id);
  }
}