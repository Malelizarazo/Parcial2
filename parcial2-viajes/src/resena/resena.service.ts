import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resena } from './entities/resena.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { Actividad } from '../actividad/entities/actividad.entity';
import { CrearResenaDTO } from './dto/crear-resena.dto';

@Injectable()
export class ResenaService {
  constructor(
    @InjectRepository(Resena)
    private resenaRepository: Repository<Resena>,
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Actividad)
    private actividadRepository: Repository<Actividad>,
  ) {}

  async agregarResena(
    estudianteId: number,
    actividadId: number,
    resenaDTO: CrearResenaDTO,
  ): Promise<Resena> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id: estudianteId },
      relations: ['actividades'],
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    const actividad = await this.actividadRepository.findOne({
      where: { id: actividadId },
    });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');
    if (actividad.estado !== 2) {
      throw new BadRequestException('La actividad no está finalizada');
    }
    if (!estudiante.actividades.some((a) => a.id === actividadId)) {
      throw new BadRequestException(
        'El estudiante no está inscrito en la actividad',
      );
    }
    const resena = this.resenaRepository.create({
      ...resenaDTO,
      estudiante,
      actividad,
    });
    return this.resenaRepository.save(resena);
  }

  async findResenaById(id: number): Promise<Resena> {
    const resena = await this.resenaRepository.findOne({
      where: { id },
      relations: ['estudiante', 'actividad'],
    });
    if (!resena) throw new NotFoundException('Reseña no encontrada');
    return resena;
  }
} 