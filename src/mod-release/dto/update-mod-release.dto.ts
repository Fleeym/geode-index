import { PartialType } from '@nestjs/mapped-types';
import { CreateModReleaseDto } from './create-mod-release.dto';

export class UpdateModReleaseDto extends PartialType(CreateModReleaseDto) {}
