import { User } from '../../users/entities/user.entity';
import { Concert } from '../../concerts/entities/concert.entity';
export declare class Reservation {
    id: number;
    userId: number;
    user: User;
    concertId: number;
    concert: Concert;
    seats: number;
    status: 'reserved' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}
