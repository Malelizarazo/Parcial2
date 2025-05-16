import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resena } from './entities/resena.entity';
import { ResenaService } from './resena.service';
import { ResenaController } from './resena.controller';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { Actividad } from '../actividad/entities/actividad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Resena, Estudiante, Actividad])],
  providers: [ResenaService],
  controllers: [ResenaController],
  exports: [ResenaService],
})
export class ResenaModule {}
