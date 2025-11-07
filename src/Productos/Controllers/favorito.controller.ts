import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { FavoritosService } from '../Services/favoritos.service';
import { AgregarFavoritoDTO } from '../DTOs/agregarfavorito.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('favoritos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('cliente')
export class FavoritoController {
  constructor(private readonly favoritosService: FavoritosService) {}
  
  @Get()
  async listarFavoritos(@Request() req) {
    return await this.favoritosService.listarFavoritos(req.user.usuarioId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async agregarFavorito(@Request() req, @Body() dto: AgregarFavoritoDTO) {
    dto.UsuarioId = req.user.usuarioId;
    return await this.favoritosService.agregarFavorito(dto);
  }

  @Delete(':productoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarFavorito(
    @Request() req, 
    @Param('productoId', ParseIntPipe) productoId: number
  ) {
    const usuarioId = req.user.usuarioId;
    await this.favoritosService.eliminarFavorito(usuarioId, productoId);
  }
}