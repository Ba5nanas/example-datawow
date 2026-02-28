// Note: Install @nestjs/mapped-types for PartialType
// npm install @nestjs/mapped-types

export class UpdateReservationDto {
  status?: 'reserved' | 'cancelled';
}
