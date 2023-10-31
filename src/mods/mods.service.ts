import { Inject, Injectable } from '@nestjs/common';
import { CreateModDto } from './dto/create-mod.dto';
import { UpdateModDto } from './dto/update-mod.dto';
import { Repository } from 'typeorm';
import { Mod } from './entities/mod.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ModsService {
  constructor(
    @InjectRepository(Mod)
    private modRepository: Repository<Mod>,
  ) {}

  create(createModDto: CreateModDto) {
    return 'This action adds a new mod';
  }

  findAll(): Promise<Mod[]> {
    return this.modRepository.find();
  }

  findOne(id: string): Promise<Mod | null> {
    return this.modRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  update(id: string, updateModDto: UpdateModDto) {
    return `This action updates a #${id} mod`;
  }

  remove(id: number) {
    return `This action removes a #${id} mod`;
  }
}
