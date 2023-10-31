import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

console.log(__dirname + '/../../**/*.entity.ts');

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [__dirname + '/../../**/*.entity.js'],
        migrationsTableName: 'migrations',
        synchronize: configService.get<boolean>('debug'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
