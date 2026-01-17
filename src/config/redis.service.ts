import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

async onModuleInit() {
  this.client = new Redis({
    host: this.configService.get('REDIS_HOST'),
    port: Number(this.configService.get('REDIS_PORT')),
  });

  const pong = await this.client.ping();
  console.log('[Redis]', pong);
}


  
  getClient() {
    return this.client;
  }

  onModuleDestroy() {
    this.client.quit();
  }
}
