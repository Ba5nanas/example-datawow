import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concert } from './entities/concert.entity';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';

// Define interface for paginated response
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable()
export class ConcertsService {
  constructor(
    @InjectRepository(Concert)
    private concertsRepository: Repository<Concert>,
  ) {}

  async create(createConcertDto: CreateConcertDto): Promise<Concert> {
    const concert = this.concertsRepository.create(createConcertDto);
    return this.concertsRepository.save(concert);
  }

  // Retrieve concerts with pagination
  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResult<Concert>> {
    const [data, total] = await this.concertsRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit, // Offset
      take: limit,              // Limit
    });

    // Return structured paginated result
    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Concert> {
    const concert = await this.concertsRepository.findOne({ where: { id } });
    if (!concert) {
      throw new NotFoundException(`Concert with ID ${id} not found`);
    }
    return concert;
  }

  async update(id: number, updateConcertDto: UpdateConcertDto): Promise<Concert> {
    const concert = await this.findOne(id);
    Object.assign(concert, updateConcertDto);
    return this.concertsRepository.save(concert);
  }

  async remove(id: number): Promise<void> {
    const concert = await this.findOne(id);
    await this.concertsRepository.remove(concert);
  }
}