import { Repository } from 'typeorm';
import { Concert } from './entities/concert.entity';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';
export declare class ConcertsService {
    private concertsRepository;
    constructor(concertsRepository: Repository<Concert>);
    create(createConcertDto: CreateConcertDto): Promise<Concert>;
    findAll(): Promise<Concert[]>;
    findOne(id: number): Promise<Concert>;
    update(id: number, updateConcertDto: UpdateConcertDto): Promise<Concert>;
    remove(id: number): Promise<void>;
}
