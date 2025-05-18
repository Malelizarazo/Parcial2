import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstudianteService } from './estudiante.service';
import { Estudiante } from './entities/estudiante.entity';
import { Actividad } from '../actividad/entities/actividad.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CrearEstudianteDTO } from './dto/crear-estudiante.dto';

describe('EstudianteService', () => {
  let service: EstudianteService;
  let estudianteRepository: Repository<Estudiante>;
  let actividadRepository: Repository<Actividad>;

  const mockEstudianteRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockActividadRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstudianteService,
        {
          provide: getRepositoryToken(Estudiante),
          useValue: mockEstudianteRepository,
        },
        {
          provide: getRepositoryToken(Actividad),
          useValue: mockActividadRepository,
        },
      ],
    }).compile();

    service = module.get<EstudianteService>(EstudianteService);
    estudianteRepository = module.get<Repository<Estudiante>>(
      getRepositoryToken(Estudiante),
    );
    actividadRepository = module.get<Repository<Actividad>>(
      getRepositoryToken(Actividad),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearEstudiante', () => {
    it('should create a student successfully with valid data', async () => {
      const estudianteDTO: CrearEstudianteDTO = {
        cedula: 1234567890,
        nombre: 'Juan Pérez',
        correo: 'juan.perez@example.com',
        programa: 'Ingeniería de Sistemas',
        semestre: 5,
      };

      const estudiante = {
        id: 1,
        ...estudianteDTO,
        actividades: [],
        resenas: [],
      };

      mockEstudianteRepository.create.mockReturnValue(estudiante);
      mockEstudianteRepository.save.mockResolvedValue(estudiante);

      const result = await service.crearEstudiante(estudianteDTO);

      expect(result).toEqual(estudiante);
      expect(mockEstudianteRepository.create).toHaveBeenCalledWith(estudianteDTO);
      expect(mockEstudianteRepository.save).toHaveBeenCalledWith(estudiante);
    });

    it('should throw BadRequestException with invalid email', async () => {
      const estudianteDTO: CrearEstudianteDTO = {
        cedula: 1234567890,
        nombre: 'Juan Pérez',
        correo: 'invalid-email',
        programa: 'Ingeniería de Sistemas',
        semestre: 5,
      };

      await expect(service.crearEstudiante(estudianteDTO)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException with invalid semester', async () => {
      const estudianteDTO: CrearEstudianteDTO = {
        cedula: 1234567890,
        nombre: 'Juan Pérez',
        correo: 'juan.perez@example.com',
        programa: 'Ingeniería de Sistemas',
        semestre: 11,
      };

      await expect(service.crearEstudiante(estudianteDTO)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('inscribirseActividad', () => {
    it('should throw NotFoundException when student not found', async () => {
      mockEstudianteRepository.findOne.mockResolvedValue(null);

      await expect(
        service.inscribirseActividad(1, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when activity not found', async () => {
      mockEstudianteRepository.findOne.mockResolvedValue({
        id: 1,
        actividades: [],
      });
      mockActividadRepository.findOne.mockResolvedValue(null);

      await expect(
        service.inscribirseActividad(1, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when activity is not open', async () => {
      const estudiante = {
        id: 1,
        actividades: [],
      };
      const actividad = {
        id: 1,
        estado: 1,
        estudiantes: [],
        cupoMaximo: 10,
      };

      mockEstudianteRepository.findOne.mockResolvedValue(estudiante);
      mockActividadRepository.findOne.mockResolvedValue(actividad);

      await expect(
        service.inscribirseActividad(1, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when activity is full', async () => {
      const estudiante = {
        id: 1,
        actividades: [],
      };
      const actividad = {
        id: 1,
        estado: 0,
        estudiantes: Array(10).fill({}),
        cupoMaximo: 10,
      };

      mockEstudianteRepository.findOne.mockResolvedValue(estudiante);
      mockActividadRepository.findOne.mockResolvedValue(actividad);

      await expect(
        service.inscribirseActividad(1, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when student is already enrolled', async () => {
      const estudiante = {
        id: 1,
        actividades: [{ id: 1 }],
      };
      const actividad = {
        id: 1,
        estado: 0,
        estudiantes: [],
        cupoMaximo: 10,
      };

      mockEstudianteRepository.findOne.mockResolvedValue(estudiante);
      mockActividadRepository.findOne.mockResolvedValue(actividad);

      await expect(
        service.inscribirseActividad(1, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully enroll student in activity', async () => {
      const estudiante = {
        id: 1,
        actividades: [],
      };
      const actividad = {
        id: 1,
        estado: 0,
        estudiantes: [],
        cupoMaximo: 10,
      };

      mockEstudianteRepository.findOne.mockResolvedValue(estudiante);
      mockActividadRepository.findOne.mockResolvedValue(actividad);
      mockEstudianteRepository.save.mockResolvedValue({
        ...estudiante,
        actividades: [actividad],
      });

      const result = await service.inscribirseActividad(1, 1);

      expect(result).toEqual({ mensaje: 'Inscripción exitosa' });
      expect(mockEstudianteRepository.save).toHaveBeenCalled();
    });
  });
});
