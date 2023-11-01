import { Module } from '@nestjs/common';
import { ModReleaseService } from './mod-release.service';
import { ModReleaseController } from './mod-release.controller';

@Module({
  controllers: [ModReleaseController],
  providers: [ModReleaseService],
})
export class ModReleaseModule {}
