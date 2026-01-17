import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Debt } from './debt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Debt])],
  exports: [TypeOrmModule],
})
export class DebtsModule {}
