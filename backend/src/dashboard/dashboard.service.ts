import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concert } from '../concerts/entities/concert.entity';
import { Reservation } from '../reservations/entities/reservation.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Concert)
    private concertRepository: Repository<Concert>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
  ) {}

  async getStats() {
    // นับจำนวนการจองแยกตามสถานะ
    const totalReserve = await this.reservationRepository.count({
      where: { status: 'reserved' },
    });
    
    const totalCancel = await this.reservationRepository.count({
      where: { status: 'cancelled' },
    });

    // คำนวณที่นั่งที่เหลืออยู่ทั้งหมดจากทุกคอนเสิร์ต
    const result = await this.concertRepository
      .createQueryBuilder('concert')
      .select('SUM(concert.seat)', 'total')
      .getRawOne();
      
    const totalSeats = parseInt(result.total || '0', 10);

    return {
      totalSeats,
      totalReserve,
      totalCancel,
    };
  }
}