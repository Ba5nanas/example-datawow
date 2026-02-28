import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  create(@Body() createReservationDto: CreateReservationDto, @Request() req) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.reservationsService.findAll(page, limit);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findByUser(@Param('userId') userId: string, @Request() req) {
    if (req.user.role !== 'admin' && req.user.userId !== parseInt(userId)) {
      throw new Error('Unauthorized');
    }
    return this.reservationsService.findByUser(+userId);
  }

  @Get('concert/:concertId')
  findByConcert(@Param('concertId') concertId: string) {
    return this.reservationsService.findByConcert(+concertId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.reservationsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  update(@Param('id') id: string, @Body() updateReservationDto: UpdateReservationDto) {
    return this.reservationsService.update(+id, updateReservationDto);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelReservation(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Request() req,
  ) {
    if (req.user.role !== 'admin' && req.user.userId !== parseInt(userId)) {
      throw new Error('Unauthorized');
    }
    return this.reservationsService.cancelReservation(+id, +userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(+id);
  }
}
