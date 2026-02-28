import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Concert } from '../concerts/entities/concert.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Concert, Reservation])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}