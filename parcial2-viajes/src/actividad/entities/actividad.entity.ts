import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Estudiante } from '../../estudiante/entities/estudiante.entity';
import { Resena } from '../../resena/entities/resena.entity';

@Entity()
export class Actividad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  fecha: string;

  @Column()
  cupoMaximo: number;

  @Column()
  estado: number;

  @ManyToMany(() => Estudiante, (estudiante) => estudiante.actividades)
  estudiantes: Estudiante[];

  @OneToMany(() => Resena, (resena) => resena.actividad)
  resenas: Resena[];
}
