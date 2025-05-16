import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actividad } from './entities/actividad.entity';
import { CrearActividadDTO } from './dto/crear-actividad.dto';
import { CambiarEstadoDTO } from './dto/cambiar-estado.dto';

@Injectable()
export class ActividadService {
  constructor(
    @InjectRepository(Actividad)
    private actividadRepository: Repository<Actividad>,
  ) {}

  async crearActividad(
    actividadDTO: CrearActividadDTO,
  ): Promise<Actividad> {
    const { titulo } = actividadDTO;
    const simbolos = /[^a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]/;
    if (!titulo || titulo.length < 15 || simbolos.test(titulo)) {
      throw new BadRequestException(
        'El título debe tener mínimo 15 caracteres y no contener símbolos',
      );
    }
    const actividad = this.actividadRepository.create({
      ...actividadDTO,
      estado: 0,
    });
    return this.actividadRepository.save(actividad);
  }

  async cambiarEstado(
    id: number,
    cambiarEstadoDTO: CambiarEstadoDTO,
  ): Promise<Actividad> {
    const actividad = await this.actividadRepository.findOne({
      where: { id },
      relations: ['estudiantes'],
    });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');
    const { estado: nuevoEstado } = cambiarEstadoDTO;
    if (nuevoEstado === 1) {
      // Cerrar: al menos 80% del cupo lleno
      if (
        actividad.estudiantes.length <
        Math.ceil(actividad.cupoMaximo * 0.8)
      ) {
        throw new BadRequestException(
          'Debe tener al menos 80% del cupo lleno para cerrar',
        );
      }
    } else if (nuevoEstado === 2) {
      // Finalizar: sin cupo disponible
      if (actividad.estudiantes.length < actividad.cupoMaximo) {
        throw new BadRequestException(
          'Solo puede finalizarse si no hay cupo disponible',
        );
      }
    }
    actividad.estado = nuevoEstado;
    return this.actividadRepository.save(actividad);
  }

  async findAllActividadesByDate(fecha: string): Promise<Actividad[]> {
    return this.actividadRepository.find({ where: { fecha } });
  }
} 