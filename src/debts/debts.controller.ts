import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { DebtStatus } from '../common/enums/debt-status.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('debts')
@UseGuards(JwtAuthGuard)
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body(ValidationPipe) createDebtDto: CreateDebtDto,
  ) {
    return this.debtsService.createDebt(userId, createDebtDto);
  }

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query('status') status?: DebtStatus,
  ) {
    return this.debtsService.findUserDebts(userId, status);
  }

  @Get('summary')
  getSummary(@CurrentUser('sub') userId: string) {
    return this.debtsService.getUserDebtsSummary(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.debtsService.findDebtById(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body(ValidationPipe) updateDebtDto: UpdateDebtDto,
  ) {
    return this.debtsService.updateDebt(id, userId, updateDebtDto);
  }

  @Patch(':id/pay')
  markAsPaid(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.debtsService.markAsPaid(id, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.debtsService.deleteDebt(id, userId);
  }
}