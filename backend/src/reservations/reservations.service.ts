import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Concert } from '../concerts/entities/concert.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

// Import Cache type
import type { Cache } from 'cache-manager'; 

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable()
export class ReservationsService {
  private readonly CACHE_KEY_PREFIX = 'all_reservations';

  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
    @InjectRepository(Concert)
    private concertsRepository: Repository<Concert>,
    
    @Inject(CACHE_MANAGER) 
    private cacheManager: Cache
  ) {}

  // Clear all cache keys related to reservations
  private async clearReservationCache(): Promise<void> {
    try {
     
      const storeAny = (this.cacheManager as any).store;

      if (!storeAny) {
        return;
      }

      if (storeAny.client && typeof storeAny.client.keys === 'function') {
        const keys = await storeAny.client.keys(`${this.CACHE_KEY_PREFIX}*`);
        if (keys && keys.length > 0) {
          await storeAny.client.del(keys);
        }
      } 
      else if (typeof storeAny.keys === 'function') {
        const keys = await storeAny.keys(`${this.CACHE_KEY_PREFIX}*`);
        if (keys && keys.length > 0) {
          await Promise.all(keys.map((key: string) => this.cacheManager.del(key)));
        }
      }
      else if (typeof storeAny.reset === 'function') {
        await storeAny.reset();
      }
    } catch (error) {
      console.error('Cache Clear Error:', error);
    }
  }
  
  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    const { userId, concertId, seats = 1 } = createReservationDto;

    const concert = await this.concertsRepository.findOne({ where: { id: concertId } });
    if (!concert) {
      throw new NotFoundException(`Concert with ID ${concertId} not found`);
    }

    const existingReservation = await this.reservationsRepository.findOne({
      where: { userId, concertId, status: 'reserved' },
    });
    if (existingReservation) {
      throw new BadRequestException('You already have a reservation for this concert');
    }

    if (concert.seat < seats) {
      throw new BadRequestException('Not enough seats available');
    }

    const reservation = this.reservationsRepository.create({
      userId,
      concertId,
      seats,
      status: 'reserved',
    });

    concert.seat -= seats;
    await this.concertsRepository.save(concert);

    const savedReservation = await this.reservationsRepository.save(reservation);

    await this.clearReservationCache();

    return savedReservation;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResult<Reservation>> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}_page_${page}_limit_${limit}`;

    const cachedData = await this.cacheManager.get<PaginatedResult<Reservation>>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const [data, total] = await this.reservationsRepository.findAndCount({
      relations: ['user', 'concert'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const result: PaginatedResult<Reservation> = {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      lastPage: Math.ceil(total / limit),
    };

    // TTL is set to 600,000 ms (10 minutes)
    await this.cacheManager.set(cacheKey, result, 600000); 
    
    return result;
  }

  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
      relations: ['user', 'concert'],
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    return reservation;
  }

  async findByUser(userId: number): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      where: { userId },
      relations: ['concert'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByConcert(concertId: number): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      where: { concertId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, updateReservationDto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.findOne(id);
    
    if (updateReservationDto.status === 'cancelled' && reservation.status === 'reserved') {
      const concert = await this.concertsRepository.findOne({
        where: { id: reservation.concertId },
      });
      if (concert) {
        concert.seat += reservation.seats;
        await this.concertsRepository.save(concert);
      }
    }

    Object.assign(reservation, updateReservationDto);
    const updatedReservation = await this.reservationsRepository.save(reservation);

    await this.clearReservationCache();

    return updatedReservation;
  }

  async remove(id: number): Promise<void> {
    const reservation = await this.findOne(id);
    
    if (reservation.status === 'reserved') {
      const concert = await this.concertsRepository.findOne({
        where: { id: reservation.concertId },
      });
      if (concert) {
        concert.seat += reservation.seats;
        await this.concertsRepository.save(concert);
      }
    }

    await this.reservationsRepository.remove(reservation);

    await this.clearReservationCache();
  }

  async cancelReservation(id: number, userId: number): Promise<Reservation> {
    const reservation = await this.findOne(id);
    
    if (reservation.userId !== userId) {
      throw new BadRequestException('You can only cancel your own reservations');
    }

    if (reservation.status !== 'reserved') {
      throw new BadRequestException('This reservation cannot be cancelled');
    }

    return this.update(id, { status: 'cancelled' });
  }
}