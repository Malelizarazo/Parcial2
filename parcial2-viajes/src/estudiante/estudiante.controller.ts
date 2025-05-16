import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { CrearEstudianteDTO } from './dto/crear-estudiante.dto';
import { EstudianteDTO } from './dto/estudiante.dto';
import { MensajeDTO } from '../common/dto/mensaje.dto';

@Controller('estudiantes')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Post()
  async crearEstudiante(
    @Body() estudianteDTO: CrearEstudianteDTO,
  ): Promise<EstudianteDTO> {
    return this.estudianteService.crearEstudiante(estudianteDTO);
  }

  @Get(':id')
  async obtenerEstudiante(@Param('id') id: number): Promise<EstudianteDTO> {
    return this.estudianteService.findEstudianteById(id);
  }

  @Post(':id/inscribirse/:actividadId')
  async inscribirseActividad(
    @Param('id') id: number,
    @Param('actividadId') actividadId: number,
  ): Promise<MensajeDTO> {
    return this.estudianteService.inscribirseActividad(id, actividadId);
  }
}
