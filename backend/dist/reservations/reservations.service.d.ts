import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Concert } from '../concerts/entities/concert.entity';
export declare class ReservationsService {
    private reservationsRepository;
    private concertsRepository;
    constructor(reservationsRepository: Repository<Reservation>, concertsRepository: Repository<Concert>);
    create(createReservationDto: CreateReservationDto): Promise<Reservation>;
    findAll(): Promise<Reservation[]>;
    findOne(id: number): Promise<Reservation>;
    findByUser(userId: number): Promise<Reservation[]>;
    findByConcert(concertId: number): Promise<Reservation[]>;
    update(id: number, updateReservationDto: UpdateReservationDto): Promise<Reservation>;
    remove(id: number): Promise<void>;
    cancelReservation(id: number, userId: number): Promise<Reservation>;
}
