import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prova, ProvaDocument } from '../schemas/prova.schema';
import { CreateProvaDto } from '../dto/prova.dto';

@Injectable()
export class ProvaService {
  constructor(
    @InjectModel(Prova.name) private provaModel: Model<ProvaDocument>,
  ) {}

  async create(createProvaDto: CreateProvaDto): Promise<Prova> {
    const createdProva = new this.provaModel(createProvaDto);
    return createdProva.save();
  }

  async findAll(): Promise<Prova[]> {
    return this.provaModel.find().exec();
  }

  async findOne(id: string) {
    return this.provaModel.findById(id).exec();
  }

  async remove(id: string) {
    return this.provaModel.findByIdAndDelete(id).exec();
  }
}
