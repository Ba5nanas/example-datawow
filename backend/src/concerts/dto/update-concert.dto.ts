// Note: Install @nestjs/mapped-types for PartialType
// npm install @nestjs/mapped-types

export class UpdateConcertDto {
  name?: string;
  description?: string;
  seat?: number;
}
