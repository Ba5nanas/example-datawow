import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  const mockReservationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByUser: jest.fn(),
    findByConcert: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    cancelReservation: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get<ReservationsService>(ReservationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a reservation', async () => {
      const createReservationDto: CreateReservationDto = {
        userId: 1,
        concertId: 1,
        seats: 2,
      };

      const mockReservation = {
        id: 1,
        ...createReservationDto,
        status: 'reserved',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReservationsService.create.mockResolvedValue(mockReservation);

      const result = await controller.create(createReservationDto);

      expect(service.create).toHaveBeenCalledWith(createReservationDto);
      expect(result).toEqual(mockReservation);
    });
  });

  describe('findAll', () => {
    it('should return an array of reservations', async () => {
      const mockReservations = [
        {
          id: 1,
          userId: 1,
          concertId: 1,
          seats: 2,
          status: 'reserved',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 2,
          concertId: 2,
          seats: 1,
          status: 'reserved',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockReservationsService.findAll.mockResolvedValue(mockReservations);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockReservations);
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
        },
      ];

      mockReservationsService.findByUser.mockResolvedValue(mockReservations);

      const result = await controller.findByUser('1');

      expect(service.findByUser).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockReservations);
    });

    it('should convert string userId to number', async () => {
      const mockReservations = [];

      mockReservationsService.findByUser.mockResolvedValue(mockReservations);

      await controller.findByUser('42');

      expect(service.findByUser).toHaveBeenCalledWith(42);
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
        },
      ];

      mockReservationsService.findByConcert.mockResolvedValue(mockReservations);

      const result = await controller.findByConcert('1');

      expect(service.findByConcert).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockReservations);
    });

    it('should convert string concertId to number', async () => {
      const mockReservations = [];

      mockReservationsService.findByConcert.mockResolvedValue(mockReservations);

      await controller.findByConcert('42');

      expect(service.findByConcert).toHaveBeenCalledWith(42);
    });
  });

  describe('findOne', () => {
    it('should return a single reservation', async () => {
      const mockReservation = {
        id: 1,
        userId: 1,
        concertId: 1,
        seats: 2,
        status: 'reserved',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReservationsService.findOne.mockResolvedValue(mockReservation);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockReservation);
    });

    it('should convert string id to number', async () => {
      const mockReservation = {
        id: 1,
        userId: 1,
        concertId: 1,
        seats: 2,
        status: 'reserved',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReservationsService.findOne.mockResolvedValue(mockReservation);

      await controller.findOne('42');

      expect(service.findOne).toHaveBeenCalledWith(42);
    });
  });

  describe('update', () => {
    it('should update a reservation', async () => {
      const updateReservationDto: UpdateReservationDto = {
        status: 'cancelled',
      };

      const mockReservation = {
        id: 1,
        userId: 1,
        concertId: 1,
        seats: 2,
        status: 'cancelled',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReservationsService.update.mockResolvedValue(mockReservation);

      const result = await controller.update('1', updateReservationDto);

      expect(service.update).toHaveBeenCalledWith(1, updateReservationDto);
      expect(result).toEqual(mockReservation);
    });
  });

  describe('cancelReservation', () => {
    it('should cancel a reservation', async () => {
      const mockReservation = {
        id: 1,
        userId: 1,
        concertId: 1,
        seats: 2,
        status: 'cancelled',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReservationsService.cancelReservation.mockResolvedValue(
        mockReservation,
      );

      const result = await controller.cancelReservation('1', '1');

      expect(service.cancelReservation).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(mockReservation);
    });

    it('should convert string id and userId to numbers', async () => {
      const mockReservation = {
        id: 1,
        userId: 1,
        concertId: 1,
        seats: 2,
        status: 'cancelled',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReservationsService.cancelReservation.mockResolvedValue(
        mockReservation,
      );

      await controller.cancelReservation('42', '99');

      expect(service.cancelReservation).toHaveBeenCalledWith(42, 99);
    });
  });

  describe('remove', () => {
    it('should remove a reservation', async () => {
      mockReservationsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should convert string id to number', async () => {
      mockReservationsService.remove.mockResolvedValue(undefined);

      await controller.remove('42');

      expect(service.remove).toHaveBeenCalledWith(42);
    });
  });
});
