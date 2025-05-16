import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actividad } from './entities/actividad.entity';
import { ActividadService } from './actividad.service';
import { ActividadController } from './actividad.controller';
import { Estudiante } from '../estudiante/entities/estudiante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Actividad, Estudiante])],
  providers: [ActividadService],
  controllers: [ActividadController],
  exports: [ActividadService],
})
export class ActividadModule {} 