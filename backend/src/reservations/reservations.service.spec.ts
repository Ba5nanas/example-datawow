import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ReservationsService } from './reservations.service';
import { Reservation } from './entities/reservation.entity';
import { Concert } from '../concerts/entities/concert.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let reservationsRepository: Repository<Reservation>;
  let concertsRepository: Repository<Concert>;

  const mockReservationsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockConcertsRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationsRepository,
        },
        {
          provide: getRepositoryToken(Concert),
          useValue: mockConcertsRepository,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    reservationsRepository = module.get<Repository<Reservation>>(
      getRepositoryToken(Reservation),
    );
    concertsRepository = module.get<Repository<Concert>>(
      getRepositoryToken(Concert),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new reservation successfully', async () => {
      const createReservationDto: CreateReservationDto = {
        userId: 1,
        concertId: 1,
        seats: 2,
      };

      const mockConcert = {
        id: 1,
        name: 'Test Concert',
        description: 'Test Description',
        seat: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockReservation = {
        id: 1,
        ...createReservationDto,
        status: 'reserved',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockConcertsRepository.findOne.mockResolvedValue(mockConcert);
      mockReservationsRepository.findOne.mockResolvedValue(null);
      mockReservationsRepository.create.mockReturnValue(mockReservation);
      mockReservationsRepository.save.mockResolvedValue(mockReservation);
      mockConcertsRepository.save.mockResolvedValue({ ...mockConcert, seat: 98 });

      const result = await service.create(createReservationDto);

      expect(concertsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(reservationsRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 1, concertId: 1, status: 'reserved' },
      });
      expect(concertsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ seat: 98 }),
      );
      expect(result).toEqual(mockReservation);
    });

    it('should throw NotFoundException if concert does not exist', async () => {
      const createReservationDto: CreateReservationDto = {
        userId: 1,
        concertId: 999,
        seats: 2,
      };

      mockConcertsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createReservationDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createReservationDto)).rejects.toThrow(
        'Concert with ID 999 not found',
      );
    });

    it('should throw BadRequestException if user already has a reservation', async () => {
      const createReservationDto: CreateReservationDto = {
        userId: 1,
        concertId: 1,
        seats: 2,
      };

      const mockConcert = {
        id: 1,
        name: 'Test Concert',
        seat: 100,
      };

      const existingReservation = {
        id: 1,
        userId: 1,
        concertId: 1,
        status: 'reserved',
      };

      mockConcertsRepository.findOne.mockResolvedValue(mockConcert);
      mockReservationsRepository.findOne.mockResolvedValue(existingReservation);

      await expect(service.create(createReservationDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createReservationDto)).rejects.toThrow(
        'You already have a reservation for this concert',
      );
    });

    it('should throw BadRequestException if not enough seats available', async () => {
      const createReservationDto: CreateReservationDto = {
        userId: 1,
        concertId: 1,
        seats: 150,
      };

      const mockConcert = {
        id: 1,
        name: 'Test Concert',
        seat: 100,
      };

      mockConcertsRepository.findOne.mockResolvedValue(mockConcert);
      mockReservationsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createReservationDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createReservationDto)).rejects.toThrow(
        'Not enough seats available',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of reservations with relations', async () => {
      const mockReservations = [
        {
          id: 1,
          userId: 1,
          concertId: 1,
          seats: 2,
          status: 'reserved',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { id: 1, name: 'User 1', email: 'user1@test.com' },
          concert: { id: 1, name: 'Concert 1', seat: 100 },
        },
      ];

      mockReservationsRepository.find.mockResolvedValue(mockReservations);

      const result = await service.findAll();

      expect(reservationsRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'concert'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockReservations);
    });
  });

  describe('findOne', () => {
    it('should return a reservation by id', async () => {
      const mockReservation = {
        id: 1,
        userId: 1,
        concertId: 1,
        seats: 2,
        status: 'reserved',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 1, name: 'User 1' },
        concert: { id: 1, name: 'Concert 1' },
      };

      mockReservationsRepository.findOne.mockResolvedValue(mockReservation);

      const result = await service.findOne(1);

      expect(reservationsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user', 'concert'],
      });
      expect(result).toEqual(mockReservation);
    });

    it('should throw NotFoundException if reservation does not exist', async () => {
      mockReservationsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Reservation with ID 999 not found',
      );
    });
  });

  describe('findByUser', () => {
    it('should return reservations for a specific user', async () => {
      const mockReservations = [
        {
          id: 1,
          userId: 1,
          concertId: 1,
          seats: 2,
          status: 'reserved',
          createdAt: new Date(),
          updatedAt: new Date(),
          concert: { id: 1, name: 'Concert 1' },
        },
      ];

      mockReservationsRepository.find.mockResolvedValue(mockReservations);

      const result = await service.findByUser(1);

      expect(reservationsRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: ['concert'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockReservations);
    });
  });

  describe('findByConcert', () => {
    it('should return reservations for a specific concert', async () => {
      const mockReservations = [
        {
          id: 1,
          userId: 1,
          concertId: 1,
          seats: 2,
          status: 'reserved',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { id: 1, name: 'User 1' },
        },
      ];

      mockReservationsRepository.find.mockResolvedValue(mockReservations);

      const result = await service.findByConcert(1);

      expect(reservationsRepository.find).toHaveBeenCalledWith({
        where: { concertId: 1 },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockReservations);
    });
  });

  describe('update', () => {
    it('should update a reservation', async () => {
      const existingReservation = {
        id: 1,
        userId: 1,
        concertId: 1,
        seats: 2,
        status: 'reserved',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateReservationDto: UpdateReservationDto = {
        status: 'cancelled',
      };

      const mockConcert = {
        id: 1,
        name: 'Test Concert',
        seat: 98,
      };

      mockReservationsRepository.findOne.mockResolvedValue(existingReservation);
      mockConcertsRepository.findOne.mockResolvedValue(mockConcert);
      mockReservationsRepository.save.mockResolvedValue({
        ...existingReservation,
        ...updateReservationDto,
      });
      mockConcertsRepository.save.mockResolvedValue({ ...mockConcert, seat: 100 });

      const result = await service.update(1, updateReservationDto);

      expect(concertsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(concertsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ seat: 100 }),
      );
      expect(result).toEqual(
        expect.objectContaining(updateReservationDto),
      );
    });

    it('should not restore seats when not cancelling', async () => {
      const existingReservation = {
        id: 1,
        userId: 1,
        concertId: 1,
        seats: 2,
        status: 'reserved',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateReservationDto: UpdateReservationDto = {
        status: 'reserved',
      };

      mockReservationsRepository.findOne.mockResolvedValue(existingReservation);
      mockReservationsRepository.save.mockResolvedValue({
        ...existingReservation,
      });

      await service.update(1, updateReservationDto);

      expect(concertsRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a reservation and restore seats', async () => {
      const existingReservation = {
        id: 1,
        userId: 1,
        concertId: 1,
        seats: 2,
        status: 'reserved',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockConcert = {
        id: 1,
        name: 'Test Concert',
        seat: 98,
      };

      mockReservationsRepository.findOne.mockResolvedValue(existingReservation);
      mockConcertsRepository.findOne.mockResolvedValue(mockConcert);
      mockReservationsRepository.remove.mockResolvedValue(existingReservation);
      mockConcertsRepository.save.mockResolvedValue({ ...mockConcert, seat: 100 });

      await service.remove(1);

      expect(concertsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(concertsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ seat: 100 }),
      );
      expect(reservationsRepository.remove).toHaveBeenCalledWith(
        existingReservation,
      );
    });
  });

  describe('cancelReservation', () => {
    it('should cancel a reservation owned by user', async () => {
      const existingReservation = {
        id: 1,
        userId: 1,
        concertId: 1,
        seats: 2,
        status: 'reserved',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockConcert = {
        id: 1,
        name: 'Test Concert',
        seat: 98,
      };

      mockReservationsRepository.findOne.mockResolvedValue(existingReservation);
      mockConcertsRepository.findOne.mockResolvedValue(mockConcert);
      mockReservationsRepository.save.mockResolvedValue({
        ...existingReservation,
        status: 'cancelled',
      });
      mockConcertsRepository.save.mockResolvedValue({ ...mockConcert, seat: 100 });

      const result = await service.cancelReservation(1, 1);

      expect(result).toEqual(
        expect.objectContaining({ status: 'cancelled' }),
      );
    });

    it('should throw BadRequestException if user does not own reservation', async () => {
      const existingReservation = {
        id: 1,
        userId: 2,
        concertId: 1,
        seats: 2,
        status: 'reserved',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReservationsRepository.findOne.mockResolvedValue(existingReservation);

      await expect(service.cancelReservation(1, 1)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.cancelReservation(1, 1)).rejects.toThrow(
        'You can only cancel your own reservations',
      );
    });

    it('should throw BadRequestException if reservation is not reserved', async () => {
      const existingReservation = {
        id: 1,
        userId: 1,
        concertId: 1,
        seats: 2,
        status: 'cancelled',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReservationsRepository.findOne.mockResolvedValue(existingReservation);

      await expect(service.cancelReservation(1, 1)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.cancelReservation(1, 1)).rejects.toThrow(
        'This reservation cannot be cancelled',
      );
    });
  });
});
