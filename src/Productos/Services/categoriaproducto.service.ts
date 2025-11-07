import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CategoriaProductoRepository } from '../Repositories/categoria.repository';
import { CrearCategoriaProductoDto } from '../DTOs/crearcategoria.dto';
import { ActualizarCategoriaProductoDto } from '../DTOs/actualizarcategoria.dto';
import { ICategoriasProductosService } from '../Interfaces/categoriaproducto.interface';

@Injectable()
export class CategoriasProductosService implements ICategoriasProductosService {
  constructor(private readonly categoriaProductoRepository: CategoriaProductoRepository) {}

  async listarCategorias() {
    const categorias = await this.categoriaProductoRepository.findAll();

    return categorias.map((c) => ({
      categoriaProductoId: c.CategoriaProductoId,
      nombre: c.Nombre,
    }));
  }

  async obtenerCategoria(id: number) {
    const categoria = await this.categoriaProductoRepository.findById(id);
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return {
      categoriaProductoId: categoria.CategoriaProductoId,
      nombre: categoria.Nombre,
    };
  }

  async crearCategoria(crearDto: CrearCategoriaProductoDto) {
    const existe = await this.categoriaProductoRepository.existsByNombre(crearDto.Nombre);
    if (existe) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    const nuevaCategoria = await this.categoriaProductoRepository.create(crearDto);

    return {
      message: 'Categoría creada exitosamente',
      categoria: {
        categoriaProductoId: nuevaCategoria.CategoriaProductoId,
        nombre: nuevaCategoria.Nombre,
      },
    };
  }

  async actualizarCategoria(id: number, actualizarDto: ActualizarCategoriaProductoDto) {
    const categoria = await this.categoriaProductoRepository.findById(id);
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    if (actualizarDto.Nombre) {
      const existe = await this.categoriaProductoRepository.findByNombre(actualizarDto.Nombre);
      if (existe && existe.CategoriaProductoId !== id) {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
    }

    const categoriaActualizada = await this.categoriaProductoRepository.update(id, actualizarDto);
    if (!categoriaActualizada) {
      throw new NotFoundException('Error al actualizar la categoría');
    }

    return {
      message: 'Categoría actualizada exitosamente',
      categoria: {
        categoriaProductoId: categoriaActualizada.CategoriaProductoId,
        nombre: categoriaActualizada.Nombre,
      },
    };
  }

  async eliminarCategoria(id: number) {
    const categoria = await this.categoriaProductoRepository.findById(id);
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    await this.categoriaProductoRepository.delete(id);

    return {
      message: 'Categoría eliminada exitosamente',
    };
  }
}