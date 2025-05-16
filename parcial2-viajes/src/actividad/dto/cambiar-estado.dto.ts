import { IsInt, Min, Max } from 'class-validator';

export class CambiarEstadoDTO {
  @IsInt()
  @Min(0)
  @Max(2)
  estado: number;
}
