import { ConcertsService } from './concerts.service';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';
export declare class ConcertsController {
    private readonly concertsService;
    constructor(concertsService: ConcertsService);
    create(createConcertDto: CreateConcertDto): Promise<import("./entities/concert.entity").Concert>;
    findAll(): Promise<import("./entities/concert.entity").Concert[]>;
    findOne(id: string): Promise<import("./entities/concert.entity").Concert>;
    update(id: string, updateConcertDto: UpdateConcertDto): Promise<import("./entities/concert.entity").Concert>;
    remove(id: string): Promise<void>;
}
