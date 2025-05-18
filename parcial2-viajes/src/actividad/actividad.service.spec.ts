import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActividadService } from './actividad.service';
import { Actividad } from './entities/actividad.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CrearActividadDTO } from './dto/crear-actividad.dto';
import { CambiarEstadoDTO } from './dto/cambiar-estado.dto';

describe('ActividadService', () => {
  let service: ActividadService;
  let actividadRepository: Repository<Actividad>;

  const mockActividadRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActividadService,
        {
          provide: getRepositoryToken(Actividad),
          useValue: mockActividadRepository,
        },
      ],
    }).compile();

    service = module.get<ActividadService>(ActividadService);
    actividadRepository = module.get<Repository<Actividad>>(
      getRepositoryToken(Actividad),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearActividad', () => {
    it('should create an activity successfully with valid data', async () => {
      const actividadDTO: CrearActividadDTO = {
        titulo: 'Visita al Museo Nacional de Colombia',
        fecha: '2024-05-20',
        cupoMaximo: 30,
      };

      const actividad = {
        id: 1,
        ...actividadDTO,
        estado: 0,
        estudiantes: [],
        resenas: [],
      };

      mockActividadRepository.create.mockReturnValue(actividad);
      mockActividadRepository.save.mockResolvedValue(actividad);

      const result = await service.crearActividad(actividadDTO);

      expect(result).toEqual(actividad);
      expect(mockActividadRepository.create).toHaveBeenCalledWith({
        ...actividadDTO,
        estado: 0,
      });
      expect(mockActividadRepository.save).toHaveBeenCalledWith(actividad);
    });

    it('should throw BadRequestException with short title', async () => {
      const actividadDTO: CrearActividadDTO = {
        titulo: 'Short',
        fecha: '2024-05-20',
        cupoMaximo: 30,
      };

      await expect(service.crearActividad(actividadDTO)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException with title containing symbols', async () => {
      const actividadDTO: CrearActividadDTO = {
        titulo: 'Visita al Museo! @#$%',
        fecha: '2024-05-20',
        cupoMaximo: 30,
      };

      await expect(service.crearActividad(actividadDTO)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cambiarEstado', () => {
    it('should throw NotFoundException when activity not found', async () => {
      mockActividadRepository.findOne.mockResolvedValue(null);

      const cambiarEstadoDTO: CambiarEstadoDTO = { estado: 1 };

      await expect(
        service.cambiarEstado(1, cambiarEstadoDTO),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when trying to close with insufficient enrollment', async () => {
      const actividad = {
        id: 1,
        estado: 0,
        estudiantes: Array(5).fill({}),
        cupoMaximo: 10,
      };

      mockActividadRepository.findOne.mockResolvedValue(actividad);

      const cambiarEstadoDTO: CambiarEstadoDTO = { estado: 1 };

      await expect(
        service.cambiarEstado(1, cambiarEstadoDTO),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when trying to finalize with available spots', async () => {
      const actividad = {
        id: 1,
        estado: 1,
        estudiantes: Array(5).fill({}),
        cupoMaximo: 10,
      };

      mockActividadRepository.findOne.mockResolvedValue(actividad);

      const cambiarEstadoDTO: CambiarEstadoDTO = { estado: 2 };

      await expect(
        service.cambiarEstado(1, cambiarEstadoDTO),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully change activity state to closed', async () => {
      const actividad = {
        id: 1,
        estado: 0,
        estudiantes: Array(8).fill({}),
        cupoMaximo: 10,
      };

      const updatedActividad = {
        ...actividad,
        estado: 1,
      };

      mockActividadRepository.findOne.mockResolvedValue(actividad);
      mockActividadRepository.save.mockResolvedValue(updatedActividad);

      const cambiarEstadoDTO: CambiarEstadoDTO = { estado: 1 };

      const result = await service.cambiarEstado(1, cambiarEstadoDTO);

      expect(result).toEqual(updatedActividad);
      expect(mockActividadRepository.save).toHaveBeenCalledWith(updatedActividad);
    });

    it('should successfully change activity state to finalized', async () => {
      const actividad = {
        id: 1,
        estado: 1,
        estudiantes: Array(10).fill({}),
        cupoMaximo: 10,
      };

      const updatedActividad = {
        ...actividad,
        estado: 2,
      };

      mockActividadRepository.findOne.mockResolvedValue(actividad);
      mockActividadRepository.save.mockResolvedValue(updatedActividad);

      const cambiarEstadoDTO: CambiarEstadoDTO = { estado: 2 };

      const result = await service.cambiarEstado(1, cambiarEstadoDTO);

      expect(result).toEqual(updatedActividad);
      expect(mockActividadRepository.save).toHaveBeenCalledWith(updatedActividad);
    });
  });

  describe('findAllActividadesByDate', () => {
    it('should return activities for a specific date', async () => {
      const fecha = '2024-05-20';
      const actividades = [
        {
          id: 1,
          titulo: 'Actividad 1',
          fecha,
          cupoMaximo: 10,
          estado: 0,
        },
        {
          id: 2,
          titulo: 'Actividad 2',
          fecha,
          cupoMaximo: 20,
          estado: 1,
        },
      ];

      mockActividadRepository.find.mockResolvedValue(actividades);

      const result = await service.findAllActividadesByDate(fecha);

      expect(result).toEqual(actividades);
      expect(mockActividadRepository.find).toHaveBeenCalledWith({
        where: { fecha },
      });
    });
  });
});
