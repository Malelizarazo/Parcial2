import { IsString, IsInt, IsNumber } from 'class-validator';

export class CrearResenaDTO {
  @IsString()
  comentario: string;

  @IsInt()
  calificacion: number;

  @IsString()
  fecha: string;

  @IsNumber()
  estudianteId: number;

  @IsNumber()
  actividadId: number;
}
