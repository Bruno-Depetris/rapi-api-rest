import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CategoriaRepository } from '../Repositories/categoria.repository';
import { CrearCategoriaDto } from '../DTOs/crearcategoria.dto';
import { ActualizarCategoriaDto } from '../DTOs/actualizarcategoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private readonly categoriaRepository: CategoriaRepository) {}

  async listarCategorias() {
    const categorias = await this.categoriaRepository.findAll();

    return categorias.map((c) => ({
      categoriaId: c.CategoriaId,
      nombre: c.Categoria,
    }));
  }

  async obtenerCategoria(id: number) {
    const categoria = await this.categoriaRepository.findById(id);
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return {
      categoriaId: categoria.CategoriaId,
      nombre: categoria.Categoria,
    };
  }

  async crearCategoria(crearDto: CrearCategoriaDto) {
    const existe = await this.categoriaRepository.existsByNombre(crearDto.Categoria);
    if (existe) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    const nuevaCategoria = await this.categoriaRepository.create(crearDto);

    return {
      message: 'Categoría creada exitosamente',
      categoria: {
        categoriaId: nuevaCategoria.CategoriaId,
        nombre: nuevaCategoria.Categoria,
      },
    };
  }

  async actualizarCategoria(id: number, actualizarDto: ActualizarCategoriaDto) {
    const categoria = await this.categoriaRepository.findById(id);
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    if (actualizarDto.Categoria) {
      const existe = await this.categoriaRepository.findByNombre(actualizarDto.Categoria);
      if (existe && existe.CategoriaId !== id) {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
    }

    const categoriaActualizada = await this.categoriaRepository.update(id, actualizarDto);
    if (!categoriaActualizada) {
  throw new NotFoundException('Error al actualizar la categoría');
    }

    return {
      message: 'Categoría actualizada exitosamente',
      categoria: {
        categoriaId: categoriaActualizada.CategoriaId,
        nombre: categoriaActualizada.Categoria,
      },
    };
  }

  async eliminarCategoria(id: number) {
    const categoria = await this.categoriaRepository.findById(id);
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    await this.categoriaRepository.delete(id);

    return {
      message: 'Categoría eliminada exitosamente',
    };
  }
}
