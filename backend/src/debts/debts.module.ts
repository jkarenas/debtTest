import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Debt } from './debt.entity';
import { DebtsController } from './debts.controller';
import { DebtsService } from './debts.service';
import { RedisService } from '../config/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Debt])],
  controllers: [DebtsController],
  providers: [DebtsService, RedisService],
  exports: [DebtsService],
})
export class DebtsModule {}