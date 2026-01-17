import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { RedisService } from './config/redis.service';
import { TestEntity } from './test.entity';
import { DebtsModule } from './debts/debts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    DebtsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    TypeOrmModule.forFeature([TestEntity]), 
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class AppModule {}