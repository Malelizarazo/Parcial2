import { IsString, IsInt, MinLength, Matches } from 'class-validator';

export class CrearActividadDTO {
  @IsString()
  @MinLength(15)
  @Matches(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/, {
    message: 'El título no debe contener símbolos',
  })
  titulo: string;

  @IsString()
  fecha: string;

  @IsInt()
  cupoMaximo: number;
}
