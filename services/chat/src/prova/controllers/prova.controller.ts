import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ProvaService } from '../services/prova.service';
import { CreateProvaDto } from '../dto/prova.dto';

@Controller('prova')
export class ProvaController {
  constructor(private readonly provaService: ProvaService) {}

  @Post()
  async create(@Body() createProvaDto: CreateProvaDto) {
    return this.provaService.create(createProvaDto);
  }

  @Get()
  async findAll() {
    return this.provaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.provaService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.provaService.remove(id);
  }
}
