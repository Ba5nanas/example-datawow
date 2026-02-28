import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    create(createReservationDto: CreateReservationDto): Promise<import("./entities/reservation.entity").Reservation>;
    findAll(): Promise<import("./entities/reservation.entity").Reservation[]>;
    findByUser(userId: string): Promise<import("./entities/reservation.entity").Reservation[]>;
    findByConcert(concertId: string): Promise<import("./entities/reservation.entity").Reservation[]>;
    findOne(id: string): Promise<import("./entities/reservation.entity").Reservation>;
    update(id: string, updateReservationDto: UpdateReservationDto): Promise<import("./entities/reservation.entity").Reservation>;
    cancelReservation(id: string, userId: string): Promise<import("./entities/reservation.entity").Reservation>;
    remove(id: string): Promise<void>;
}
