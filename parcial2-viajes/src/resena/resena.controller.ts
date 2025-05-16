import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ResenaService } from './resena.service';
import { CrearResenaDTO } from './dto/crear-resena.dto';
import { ResenaDTO } from './dto/resena.dto';

@Controller('resenas')
export class ResenaController {
  constructor(private readonly resenaService: ResenaService) {}

  @Post(':estudianteId/:actividadId')
  async agregarResena(
    @Param('estudianteId') estudianteId: number,
    @Param('actividadId') actividadId: number,
    @Body() resenaDTO: CrearResenaDTO,
  ): Promise<ResenaDTO> {
    return this.resenaService.agregarResena(
      estudianteId,
      actividadId,
      resenaDTO,
    );
  }

  @Get(':id')
  async findResenaById(@Param('id') id: number): Promise<ResenaDTO> {
    return this.resenaService.findResenaById(id);
  }
}
