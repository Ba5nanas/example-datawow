import { Reservation } from '../../reservations/entities/reservation.entity';
export declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    reservations: Reservation[];
}
