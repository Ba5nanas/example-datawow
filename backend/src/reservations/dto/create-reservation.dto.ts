// Note: Install class-validator and class-transformer for validation
// npm install class-validator class-transformer

export class CreateReservationDto {
  userId: number;
  concertId: number;
  seats?: number; // Default to 1
}
