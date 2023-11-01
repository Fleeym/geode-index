import { Injectable } from '@nestjs/common';
import { CreateModReleaseDto } from './dto/create-mod-release.dto';
import { UpdateModReleaseDto } from './dto/update-mod-release.dto';

@Injectable()
export class ModReleaseService {
  create(createModReleaseDto: CreateModReleaseDto) {
    return 'This action adds a new modRelease';
  }

  findAll() {
    return `This action returns all modRelease`;
  }

  findOne(id: number) {
    return `This action returns a #${id} modRelease`;
  }

  update(id: number, updateModReleaseDto: UpdateModReleaseDto) {
    return `This action updates a #${id} modRelease`;
  }

  remove(id: number) {
    return `This action removes a #${id} modRelease`;
  }
}
