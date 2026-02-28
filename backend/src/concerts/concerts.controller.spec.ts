import { Test, TestingModule } from '@nestjs/testing';
import { ConcertsController } from './concerts.controller';
import { ConcertsService } from './concerts.service';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';
import { HttpStatus } from '@nestjs/common';

describe('ConcertsController', () => {
  let controller: ConcertsController;
  let service: ConcertsService;

  const mockConcertsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConcertsController],
      providers: [
        {
          provide: ConcertsService,
          useValue: mockConcertsService,
        },
      ],
    }).compile();

    controller = module.get<ConcertsController>(ConcertsController);
    service = module.get<ConcertsService>(ConcertsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a concert', async () => {
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

      mockConcertsService.create.mockResolvedValue(mockConcert);

      const result = await controller.create(createConcertDto);

      expect(service.create).toHaveBeenCalledWith(createConcertDto);
      expect(result).toEqual(mockConcert);
    });
  });

  describe('findAll', () => {
    it('should return an array of concerts', async () => {
      const mockConcerts = [
        {
          id: 1,
          name: 'Concert 1',
          description: 'Description 1',
          seat: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Concert 2',
          description: 'Description 2',
          seat: 200,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockConcertsService.findAll.mockResolvedValue(mockConcerts);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockConcerts);
    });
  });

  describe('findOne', () => {
    it('should return a single concert', async () => {
      const mockConcert = {
        id: 1,
        name: 'Test Concert',
        description: 'Test Description',
        seat: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockConcertsService.findOne.mockResolvedValue(mockConcert);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockConcert);
    });

    it('should convert string id to number', async () => {
      const mockConcert = {
        id: 1,
        name: 'Test Concert',
        description: 'Test Description',
        seat: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockConcertsService.findOne.mockResolvedValue(mockConcert);

      await controller.findOne('42');

      expect(service.findOne).toHaveBeenCalledWith(42);
    });
  });

  describe('update', () => {
    it('should update a concert', async () => {
      const updateConcertDto: UpdateConcertDto = {
        name: 'Updated Concert',
      };

      const mockConcert = {
        id: 1,
        name: 'Updated Concert',
        description: 'Test Description',
        seat: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockConcertsService.update.mockResolvedValue(mockConcert);

      const result = await controller.update('1', updateConcertDto);

      expect(service.update).toHaveBeenCalledWith(1, updateConcertDto);
      expect(result).toEqual(mockConcert);
    });
  });

  describe('remove', () => {
    it('should remove a concert', async () => {
      mockConcertsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
