import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ConcertsService } from './concerts.service';
import { Concert } from './entities/concert.entity';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';

describe('ConcertsService', () => {
  let service: ConcertsService;
  let repository: Repository<Concert>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertsService,
        {
          provide: getRepositoryToken(Concert),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ConcertsService>(ConcertsService);
    repository = module.get<Repository<Concert>>(getRepositoryToken(Concert));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new concert', async () => {
      const createConcertDto: CreateConcertDto = {
        name: 'Test Concert',
        description: 'Test Description',
        seat: 100,
      };

      const mockConcert = {
        id: 1,
        ...createConcertDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockConcert);
      mockRepository.save.mockResolvedValue(mockConcert);

      const result = await service.create(createConcertDto);

      expect(repository.create).toHaveBeenCalledWith(createConcertDto);
      expect(repository.save).toHaveBeenCalledWith(mockConcert);
      expect(result).toEqual(mockConcert);
    });
  });

  describe('findAll', () => {
    it('should return an array of concerts ordered by createdAt DESC', async () => {
      const mockConcerts = [
        {
          id: 1,
          name: 'Concert 1',
          description: 'Description 1',
          seat: 100,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Concert 2',
          description: 'Description 2',
          seat: 200,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(mockConcerts);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockConcerts);
    });

    it('should return an empty array when no concerts exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a concert by id', async () => {
      const mockConcert = {
        id: 1,
        name: 'Test Concert',
        description: 'Test Description',
        seat: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockConcert);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockConcert);
    });

    it('should throw NotFoundException when concert does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Concert with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a concert', async () => {
      const existingConcert = {
        id: 1,
        name: 'Old Name',
        description: 'Old Description',
        seat: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateConcertDto: UpdateConcertDto = {
        name: 'New Name',
        seat: 150,
      };

      const updatedConcert = {
        ...existingConcert,
        ...updateConcertDto,
      };

      mockRepository.findOne.mockResolvedValue(existingConcert);
      mockRepository.save.mockResolvedValue(updatedConcert);

      const result = await service.update(1, updateConcertDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedConcert);
    });

    it('should throw NotFoundException when updating non-existent concert', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a concert', async () => {
      const mockConcert = {
        id: 1,
        name: 'Test Concert',
        description: 'Test Description',
        seat: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockConcert);
      mockRepository.remove.mockResolvedValue(mockConcert);

      await service.remove(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.remove).toHaveBeenCalledWith(mockConcert);
    });

    it('should throw NotFoundException when removing non-existent concert', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
