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
} from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';

@Controller('concerts')
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createConcertDto: CreateConcertDto) {
    return this.concertsService.create(createConcertDto);
  }

  @Get()
  findAll() {
    return this.concertsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.concertsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConcertDto: UpdateConcertDto) {
    return this.concertsService.update(+id, updateConcertDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.concertsService.remove(+id);
  }
}
