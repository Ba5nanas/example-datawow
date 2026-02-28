"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reservation_entity_1 = require("./entities/reservation.entity");
const concert_entity_1 = require("../concerts/entities/concert.entity");
let ReservationsService = class ReservationsService {
    reservationsRepository;
    concertsRepository;
    constructor(reservationsRepository, concertsRepository) {
        this.reservationsRepository = reservationsRepository;
        this.concertsRepository = concertsRepository;
    }
    async create(createReservationDto) {
        const { userId, concertId, seats = 1 } = createReservationDto;
        const concert = await this.concertsRepository.findOne({ where: { id: concertId } });
        if (!concert) {
            throw new common_1.NotFoundException(`Concert with ID ${concertId} not found`);
        }
        const existingReservation = await this.reservationsRepository.findOne({
            where: { userId, concertId, status: 'reserved' },
        });
        if (existingReservation) {
            throw new common_1.BadRequestException('You already have a reservation for this concert');
        }
        if (concert.seat < seats) {
            throw new common_1.BadRequestException('Not enough seats available');
        }
        const reservation = this.reservationsRepository.create({
            userId,
            concertId,
            seats,
            status: 'reserved',
        });
        concert.seat -= seats;
        await this.concertsRepository.save(concert);
        return this.reservationsRepository.save(reservation);
    }
    async findAll() {
        return this.reservationsRepository.find({
            relations: ['user', 'concert'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const reservation = await this.reservationsRepository.findOne({
            where: { id },
            relations: ['user', 'concert'],
        });
        if (!reservation) {
            throw new common_1.NotFoundException(`Reservation with ID ${id} not found`);
        }
        return reservation;
    }
    async findByUser(userId) {
        return this.reservationsRepository.find({
            where: { userId },
            relations: ['concert'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByConcert(concertId) {
        return this.reservationsRepository.find({
            where: { concertId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }
    async update(id, updateReservationDto) {
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
        return this.reservationsRepository.save(reservation);
    }
    async remove(id) {
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
    }
    async cancelReservation(id, userId) {
        const reservation = await this.findOne(id);
        if (reservation.userId !== userId) {
            throw new common_1.BadRequestException('You can only cancel your own reservations');
        }
        if (reservation.status !== 'reserved') {
            throw new common_1.BadRequestException('This reservation cannot be cancelled');
        }
        return this.update(id, { status: 'cancelled' });
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __param(1, (0, typeorm_1.InjectRepository)(concert_entity_1.Concert)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map