// Note: Install class-validator and class-transformer for validation
// npm install class-validator class-transformer

export class CreateConcertDto {
  name: string;
  description: string;
  seat: number;
}
