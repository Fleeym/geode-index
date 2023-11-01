import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ModReleaseService } from './mod-release.service';
import { CreateModReleaseDto } from './dto/create-mod-release.dto';
import { UpdateModReleaseDto } from './dto/update-mod-release.dto';

@Controller('mod-release')
export class ModReleaseController {
  constructor(private readonly modReleaseService: ModReleaseService) {}

  @Post()
  create(@Body() createModReleaseDto: CreateModReleaseDto) {
    return this.modReleaseService.create(createModReleaseDto);
  }

  @Get()
  findAll() {
    return this.modReleaseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modReleaseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModReleaseDto: UpdateModReleaseDto) {
    return this.modReleaseService.update(+id, updateModReleaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modReleaseService.remove(+id);
  }
}
