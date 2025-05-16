import { EstudianteDTO } from '../../estudiante/dto/estudiante.dto';
import { ActividadDTO } from '../../actividad/dto/actividad.dto';

export class ResenaDTO {
  id: number;
  comentario: string;
  calificacion: number;
  fecha: string;
  estudiante: EstudianteDTO;
  actividad: ActividadDTO;
}
