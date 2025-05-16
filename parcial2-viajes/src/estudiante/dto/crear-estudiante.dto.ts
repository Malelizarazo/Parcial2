import { IsInt, IsString, IsEmail, Min, Max } from 'class-validator';

export class CrearEstudianteDTO {
  @IsInt()
  cedula: number;

  @IsString()
  nombre: string;

  @IsEmail()
  correo: string;

  @IsString()
  programa: string;

  @IsInt()
  @Min(1)
  @Max(10)
  semestre: number;
}
