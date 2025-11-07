import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { NegocioRepository } from '../Repositories/negocio.repository';
import { VendedorRepository } from '../../Usuarios/Repositories/vendedor.repository';
import { ActualizarNegocioDto } from '../DTOs/actualizarnegocio.dto';
import { INegociosService } from '../Interfaces/negocioService.interface';

@Injectable()
export class NegociosService implements INegociosService {
  constructor(
    private readonly negocioRepository: NegocioRepository,
    private readonly vendedorRepository: VendedorRepository,
  ) {}

  async listarNegocios(page: number = 1, limit: number = 10) {
    const negocios = await this.negocioRepository.findAll(page, limit);
    const total = await this.negocioRepository.count();

    return {
      data: negocios.map((n) => ({
        negocioId: n.NegocioId,
        nombreNegocio: n.NombreNegocio,
        categoriaId: n.CategoriaId,
        categoria: n.categoria ? {
          categoriaId: n.categoria.CategoriaId,
          nombre: n.categoria.Categoria,
        } : null,
      })),
      total,
      page,
      limit,

      totalPages: Math.ceil(total / limit),
    };
  }

  async buscarNegocios(termino: string, page: number = 1, limit: number = 10) {
    const negocios = await this.negocioRepository.search(termino, page, limit);

    return {
      data: negocios.map((n) => ({
        negocioId: n.NegocioId,
        nombreNegocio: n.NombreNegocio,
        categoriaId: n.CategoriaId,
        categoria: n.categoria ? {
          categoriaId: n.categoria.CategoriaId,
          nombre: n.categoria.Categoria,
        } : null,
      })),
      termino,
      page,
      limit,
    };
  }

  async obtenerNegocio(id: number) {
    const negocio = await this.negocioRepository.findById(id);
    if (!negocio) {
      throw new NotFoundException('Negocio no encontrado');
    }

    return {
      negocioId: negocio.NegocioId,
      nombreNegocio: negocio.NombreNegocio,
      categoriaId: negocio.CategoriaId,
      categoria: negocio.categoria ? {
        categoriaId: negocio.categoria.CategoriaId,
        nombre: negocio.categoria.Categoria,
      } : null,
    };
  }

  async obtenerMiNegocio(usuarioId: number) {
    const vendedor = await this.vendedorRepository.findByUsuarioId(usuarioId);
    if (!vendedor) {
      throw new NotFoundException('No eres vendedor');
    }

    if (!vendedor.NegocioId) {
      throw new NotFoundException('No tienes un negocio asignado');
    }

    const negocio = await this.negocioRepository.findById(vendedor.NegocioId);
    if (!negocio) {
      throw new NotFoundException('Negocio no encontrado');
    }

    return {
      negocioId: negocio.NegocioId,
      nombreNegocio: negocio.NombreNegocio,
      categoriaId: negocio.CategoriaId,
      categoria: negocio.categoria ? {
        categoriaId: negocio.categoria.CategoriaId,
        nombre: negocio.categoria.Categoria,
      } : null,
      vendedor: {
        vendedorId: vendedor.VendedorId,
        telefono: vendedor.Telefono,
        horario: vendedor.Horario,
        direccion: vendedor.Direccion,
      },
    };
  }

  async actualizarNegocio(
    negocioId: number,
    usuarioId: number,
    rol: string,
    actualizarDto: ActualizarNegocioDto,
  ) {
    const negocio = await this.negocioRepository.findById(negocioId);
    if (!negocio) {
      throw new NotFoundException('Negocio no encontrado');
    }

    if (rol !== 'admin') {
      const vendedor = await this.vendedorRepository.findByUsuarioId(usuarioId);
      if (!vendedor || vendedor.NegocioId !== negocioId) {
        throw new ForbiddenException('No tienes permiso para actualizar este negocio');
      }
    }

    if (actualizarDto.NombreNegocio) {
      const existeNombre = await this.negocioRepository.findByNombre(actualizarDto.NombreNegocio);
      if (existeNombre && existeNombre.NegocioId !== negocioId) {
        throw new ConflictException('Ya existe un negocio con ese nombre');
      }
    }

    const negocioActualizado = await this.negocioRepository.update(negocioId, actualizarDto);

    if (!negocioActualizado) {
  throw new NotFoundException('Error al actualizar el negocio');
}
    return {
      message: 'Negocio actualizado exitosamente',
      negocio: {
        negocioId: negocioActualizado.NegocioId,
        nombreNegocio: negocioActualizado.NombreNegocio,
        categoriaId: negocioActualizado.CategoriaId,
      },
    };
  }

  async eliminarNegocio(negocioId: number, usuarioId: number, rol: string) {
    const negocio = await this.negocioRepository.findById(negocioId);
    if (!negocio) {
      throw new NotFoundException('Negocio no encontrado');
    }

    if (rol !== 'admin') {
      const vendedor = await this.vendedorRepository.findByUsuarioId(usuarioId);
      if (!vendedor || vendedor.NegocioId !== negocioId) {
        throw new ForbiddenException('No tienes permiso para eliminar este negocio');
      }
    }

    await this.negocioRepository.delete(negocioId);

    return {
      message: 'Negocio eliminado exitosamente',
    };
  }

  async listarPorCategoria(categoriaId: number) {
    const negocios = await this.negocioRepository.findByCategoria(categoriaId);

    return negocios.map((n) => ({
      negocioId: n.NegocioId,
      nombreNegocio: n.NombreNegocio,
      categoriaId: n.CategoriaId,
      categoria: n.categoria ? {
        categoriaId: n.categoria.CategoriaId,
        nombre: n.categoria.Categoria,
      } : null,
    }));
  }
}