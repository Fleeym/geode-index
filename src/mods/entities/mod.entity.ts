import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mods')
export class Mod {
  @PrimaryColumn('varchar', { length: 100 })
  id: string;

  @Column('varchar', { length: 255 })
  latest_download_link: string;

  @Column('varchar', { length: 255 })
  latest_hash: string;

  @Column('varchar', { length: 255 })
  latest_hash256: string;

  @Column('varchar', { length: 65 })
  version: string;
}
