import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Actividad } from '../../actividad/entities/actividad.entity';
import { Resena } from '../../resena/entities/resena.entity';

@Entity()
export class Estudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cedula: number;

  @Column()
  nombre: string;

  @Column()
  correo: string;

  @Column()
  programa: string;

  @Column()
  semestre: number;

  @ManyToMany(() => Actividad, (actividad) => actividad.estudiantes)
  @JoinTable({
    name: 'estudiante_actividades_actividad',
  })
  actividades: Actividad[];

  @OneToMany(() => Resena, (resena) => resena.estudiante)
  resenas: Resena[];
}
