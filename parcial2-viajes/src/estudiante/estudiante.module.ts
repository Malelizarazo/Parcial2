import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';
import { Actividad } from '../actividad/entities/actividad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Estudiante, Actividad])],
  providers: [EstudianteService],
  controllers: [EstudianteController],
  exports: [EstudianteService],
})
export class EstudianteModule {}
