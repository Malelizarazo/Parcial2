import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { Actividad } from '../actividad/entities/actividad.entity';
import { CrearEstudianteDTO } from './dto/crear-estudiante.dto';
import { MensajeDTO } from '../common/dto/mensaje.dto';

@Injectable()
export class EstudianteService {
  constructor(
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Actividad)
    private actividadRepository: Repository<Actividad>,
  ) {}

  async crearEstudiante(estudianteDTO: CrearEstudianteDTO): Promise<Estudiante> {
    const { correo, semestre } = estudianteDTO;
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(correo)) {
      throw new BadRequestException('Correo inválido');
    }
    if (typeof semestre !== 'number' || semestre < 1 || semestre > 10) {
      throw new BadRequestException('Semestre debe estar entre 1 y 10');
    }
    const estudiante = this.estudianteRepository.create(estudianteDTO);
    return this.estudianteRepository.save(estudiante);
  }

  async findEstudianteById(id: number): Promise<Estudiante> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id },
      relations: ['actividades', 'resenas'],
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    return estudiante;
  }

  async inscribirseActividad(estudianteId: number, actividadId: number): Promise<MensajeDTO> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id: estudianteId },
      relations: ['actividades'],
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    const actividad = await this.actividadRepository.findOne({
      where: { id: actividadId },
      relations: ['estudiantes'],
    });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');
    if (actividad.estado !== 0) throw new BadRequestException('La actividad no está abierta');
    if (actividad.estudiantes.length >= actividad.cupoMaximo) throw new BadRequestException('No hay cupo disponible');
    if (estudiante.actividades.some(a => a.id === actividadId)) throw new BadRequestException('Ya está inscrito en esta actividad');
    estudiante.actividades.push(actividad);
    await this.estudianteRepository.save(estudiante);
    return { mensaje: 'Inscripción exitosa' };
  }
} 