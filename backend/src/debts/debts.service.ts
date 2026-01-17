import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debt } from './debt.entity';
import { DebtStatus } from '../common/enums/debt-status.enum';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { RedisService } from '../config/redis.service';

@Injectable()
export class DebtsService {
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
    private readonly redisService: RedisService,
  ) {}

  async createDebt(userId: string, createDebtDto: CreateDebtDto): Promise<Debt> {
    const debt = this.debtRepository.create({
      ...createDebtDto,
      user: { id: userId },
      status: DebtStatus.PENDING,
    });

    const savedDebt = await this.debtRepository.save(debt);
    
    // Invalidar caché del usuario
    await this.redisService.deletePattern(`user_debts:${userId}:*`);
    
    return this.debtRepository.findOne({
      where: { id: savedDebt.id },
      relations: ['user'],
    });
  }

  async findUserDebts(userId: string, status?: DebtStatus): Promise<Debt[]> {
    const cacheKey = `user_debts:${userId}:${status || 'all'}`;
    
    // Intentar obtener del caché
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const queryBuilder = this.debtRepository
      .createQueryBuilder('debt')
      .leftJoinAndSelect('debt.user', 'user')
      .where('debt.user.id = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('debt.status = :status', { status });
    }

    const debts = await queryBuilder
      .orderBy('debt.createdAt', 'DESC')
      .getMany();

    // Guardar en caché por 5 minutos
    await this.redisService.set(cacheKey, JSON.stringify(debts), 300);

    return debts;
  }

  async findDebtById(id: string, userId: string): Promise<Debt> {
    const debt = await this.debtRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!debt) {
      throw new NotFoundException('Debt not found');
    }

    if (debt.user.id !== userId) {
      throw new ForbiddenException('You can only access your own debts');
    }

    return debt;
  }

  async updateDebt(id: string, userId: string, updateDebtDto: UpdateDebtDto): Promise<Debt> {
    const debt = await this.findDebtById(id, userId);

    if (debt.status === DebtStatus.PAID) {
      throw new ForbiddenException('Cannot update a paid debt');
    }

    Object.assign(debt, updateDebtDto);
    const updatedDebt = await this.debtRepository.save(debt);

    // Invalidar caché del usuario
    await this.redisService.deletePattern(`user_debts:${userId}:*`);

    return updatedDebt;
  }

  async markAsPaid(id: string, userId: string): Promise<Debt> {
    const debt = await this.findDebtById(id, userId);

    if (debt.status === DebtStatus.PAID) {
      throw new ForbiddenException('Debt is already paid');
    }

    debt.status = DebtStatus.PAID;
    debt.paidAt = new Date();

    const updatedDebt = await this.debtRepository.save(debt);

    // Invalidar caché del usuario
    await this.redisService.deletePattern(`user_debts:${userId}:*`);

    return updatedDebt;
  }

  async deleteDebt(id: string, userId: string): Promise<void> {
    const debt = await this.findDebtById(id, userId);

    if (debt.status === DebtStatus.PAID) {
      throw new ForbiddenException('Cannot delete a paid debt');
    }

    await this.debtRepository.remove(debt);

    // Invalidar caché del usuario
    await this.redisService.deletePattern(`user_debts:${userId}:*`);
  }

async getUserDebtsSummary(userId: string) {
  const cacheKey = `user_summary:${userId}`;
  
  const cached = await this.redisService.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const [pending, paid] = await Promise.all([
    this.debtRepository
      .createQueryBuilder('debt')
      .select('COUNT(debt.id)', 'count')
      .addSelect('COALESCE(SUM(debt.amount), 0)', 'total')
      .where('debt.user.id = :userId AND debt.status = :status', {
        userId,
        status: DebtStatus.PENDING,
      })
      .getRawOne(),
    this.debtRepository
      .createQueryBuilder('debt')
      .select('COUNT(debt.id)', 'count')
      .addSelect('COALESCE(SUM(debt.amount), 0)', 'total')
      .where('debt.user.id = :userId AND debt.status = :status', {
        userId,
        status: DebtStatus.PAID,
      })
      .getRawOne(),
  ]);

  const pendingCount = parseInt(pending.count) || 0;
  const paidCount = parseInt(paid.count) || 0;
  const pendingTotal = parseFloat(pending.total) || 0;
  const paidTotal = parseFloat(paid.total) || 0;

  const summary = {
    totalDebts: pendingCount + paidCount,
    pendingDebts: pendingCount,
    paidDebts: paidCount,
    totalAmount: pendingTotal + paidTotal,
    pendingAmount: pendingTotal,
    paidAmount: paidTotal,
  };

  // Cachear por 2 minutos
  await this.redisService.set(cacheKey, JSON.stringify(summary), 120);

  return summary;
}
}