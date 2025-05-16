import { Controller, Post, Patch, Get, Param, Body } from '@nestjs/common';
import { ActividadService } from './actividad.service';
import { CrearActividadDTO } from './dto/crear-actividad.dto';
import { CambiarEstadoDTO } from './dto/cambiar-estado.dto';
import { ActividadDTO } from './dto/actividad.dto';

@Controller('actividades')
export class ActividadController {
  constructor(private readonly actividadService: ActividadService) {}

  @Post()
  async crearActividad(
    @Body() actividadDTO: CrearActividadDTO,
  ): Promise<ActividadDTO> {
    return this.actividadService.crearActividad(actividadDTO);
  }

  @Patch(':id/estado')
  async cambiarEstado(
    @Param('id') id: number,
    @Body() cambiarEstadoDTO: CambiarEstadoDTO,
  ): Promise<ActividadDTO> {
    return this.actividadService.cambiarEstado(id, cambiarEstadoDTO);
  }

  @Get('fecha/:fecha')
  async findAllActividadesByDate(
    @Param('fecha') fecha: string,
  ): Promise<ActividadDTO[]> {
    return this.actividadService.findAllActividadesByDate(fecha);
  }
}
