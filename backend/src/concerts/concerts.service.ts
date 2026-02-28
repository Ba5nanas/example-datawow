import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concert } from './entities/concert.entity';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';

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

  async findAll(): Promise<Concert[]> {
    return this.concertsRepository.find({
      order: { createdAt: 'DESC' },
    });
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
