import { Module } from '@nestjs/common';
import { ModsService } from './mods.service';
import { ModsController } from './mods.controller';
import { Mod } from './entities/mod.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ModsController],
  imports: [TypeOrmModule.forFeature([Mod])],
  providers: [ModsService],
})
export class ModsModule {}
