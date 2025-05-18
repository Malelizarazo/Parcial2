import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResenaService } from './resena.service';
import { Resena } from './entities/resena.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { Actividad } from '../actividad/entities/actividad.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CrearResenaDTO } from './dto/crear-resena.dto';

describe('ResenaService', () => {
  let service: ResenaService;
  let resenaRepository: Repository<Resena>;
  let estudianteRepository: Repository<Estudiante>;
  let actividadRepository: Repository<Actividad>;

  const mockResenaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockEstudianteRepository = {
    findOne: jest.fn(),
  };

  const mockActividadRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResenaService,
        {
          provide: getRepositoryToken(Resena),
          useValue: mockResenaRepository,
        },
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

    service = module.get<ResenaService>(ResenaService);
    resenaRepository = module.get<Repository<Resena>>(
      getRepositoryToken(Resena),
    );
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

  describe('agregarResena', () => {
    it('should throw NotFoundException when student not found', async () => {
      mockEstudianteRepository.findOne.mockResolvedValue(null);

      const resenaDTO: CrearResenaDTO = {
        comentario: 'Excelente actividad',
        calificacion: 5,
        fecha: '2024-05-20',
        estudianteId: 1,
        actividadId: 1,
      };

      await expect(
        service.agregarResena(1, 1, resenaDTO),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when activity not found', async () => {
      mockEstudianteRepository.findOne.mockResolvedValue({
        id: 1,
        actividades: [{ id: 1 }],
      });
      mockActividadRepository.findOne.mockResolvedValue(null);

      const resenaDTO: CrearResenaDTO = {
        comentario: 'Excelente actividad',
        calificacion: 5,
        fecha: '2024-05-20',
        estudianteId: 1,
        actividadId: 1,
      };

      await expect(
        service.agregarResena(1, 1, resenaDTO),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when activity is not finalized', async () => {
      const estudiante = {
        id: 1,
        actividades: [{ id: 1 }],
      };
      const actividad = {
        id: 1,
        estado: 1,
      };

      mockEstudianteRepository.findOne.mockResolvedValue(estudiante);
      mockActividadRepository.findOne.mockResolvedValue(actividad);

      const resenaDTO: CrearResenaDTO = {
        comentario: 'Excelente actividad',
        calificacion: 5,
        fecha: '2024-05-20',
        estudianteId: 1,
        actividadId: 1,
      };

      await expect(
        service.agregarResena(1, 1, resenaDTO),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when student is not enrolled', async () => {
      const estudiante = {
        id: 1,
        actividades: [],
      };
      const actividad = {
        id: 1,
        estado: 2,
      };

      mockEstudianteRepository.findOne.mockResolvedValue(estudiante);
      mockActividadRepository.findOne.mockResolvedValue(actividad);

      const resenaDTO: CrearResenaDTO = {
        comentario: 'Excelente actividad',
        calificacion: 5,
        fecha: '2024-05-20',
        estudianteId: 1,
        actividadId: 1,
      };

      await expect(
        service.agregarResena(1, 1, resenaDTO),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully add a review', async () => {
      const estudiante = {
        id: 1,
        actividades: [{ id: 1 }],
      };
      const actividad = {
        id: 1,
        estado: 2,
      };

      const resenaDTO: CrearResenaDTO = {
        comentario: 'Excelente actividad',
        calificacion: 5,
        fecha: '2024-05-20',
        estudianteId: 1,
        actividadId: 1,
      };

      const resena = {
        id: 1,
        ...resenaDTO,
        estudiante,
        actividad,
      };

      mockEstudianteRepository.findOne.mockResolvedValue(estudiante);
      mockActividadRepository.findOne.mockResolvedValue(actividad);
      mockResenaRepository.create.mockReturnValue(resena);
      mockResenaRepository.save.mockResolvedValue(resena);

      const result = await service.agregarResena(1, 1, resenaDTO);

      expect(result).toEqual(resena);
      expect(mockResenaRepository.create).toHaveBeenCalledWith({
        ...resenaDTO,
        estudiante,
        actividad,
      });
      expect(mockResenaRepository.save).toHaveBeenCalledWith(resena);
    });
  });

  describe('findResenaById', () => {
    it('should throw NotFoundException when review not found', async () => {
      mockResenaRepository.findOne.mockResolvedValue(null);

      await expect(service.findResenaById(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return a review when found', async () => {
      const resena = {
        id: 1,
        comentario: 'Excelente actividad',
        calificacion: 5,
        fecha: '2024-05-20',
        estudiante: { id: 1 },
        actividad: { id: 1 },
      };

      mockResenaRepository.findOne.mockResolvedValue(resena);

      const result = await service.findResenaById(1);

      expect(result).toEqual(resena);
      expect(mockResenaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['estudiante', 'actividad'],
      });
    });
  });
});
