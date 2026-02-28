import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Concert } from '../concerts/entities/concert.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
    @InjectRepository(Concert)
    private concertsRepository: Repository<Concert>,
  ) {}

  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    const { userId, concertId, seats = 1 } = createReservationDto;

    // Check if concert exists
    const concert = await this.concertsRepository.findOne({ where: { id: concertId } });
    if (!concert) {
      throw new NotFoundException(`Concert with ID ${concertId} not found`);
    }

    // Check if user already has a reservation for this concert
    const existingReservation = await this.reservationsRepository.findOne({
      where: { userId, concertId, status: 'reserved' },
    });
    if (existingReservation) {
      throw new BadRequestException('You already have a reservation for this concert');
    }

    // Check if enough seats are available
    if (concert.seat < seats) {
      throw new BadRequestException('Not enough seats available');
    }

    // Create reservation
    const reservation = this.reservationsRepository.create({
      userId,
      concertId,
      seats,
      status: 'reserved',
    });

    // Update concert seats
    concert.seat -= seats;
    await this.concertsRepository.save(concert);

    return this.reservationsRepository.save(reservation);
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      relations: ['user', 'concert'],
      order: { createdAt: 'DESC' },
    });
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
    
    // If cancelling, restore seats to concert
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
    return this.reservationsRepository.save(reservation);
  }

  async remove(id: number): Promise<void> {
    const reservation = await this.findOne(id);
    
    // Restore seats to concert before deleting
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
  }

  async cancelReservation(id: number, userId: number): Promise<Reservation> {
    const reservation = await this.findOne(id);
    
    // Check if user owns this reservation
    if (reservation.userId !== userId) {
      throw new BadRequestException('You can only cancel your own reservations');
    }

    // Only allow cancellation if status is 'reserved'
    if (reservation.status !== 'reserved') {
      throw new BadRequestException('This reservation cannot be cancelled');
    }

    return this.update(id, { status: 'cancelled' });
  }
}
