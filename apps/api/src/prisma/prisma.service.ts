import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('✅ Prisma connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Définit les GUC pour Row Level Security (appelé depuis RlsInterceptor).
   */
  async setRlsContext(userId: string | null, role: string | null): Promise<void> {
    await this.$executeRawUnsafe(
      `SET LOCAL app.current_user_id = '${userId ?? ''}'; ` +
        `SET LOCAL app.current_user_role = '${role ?? ''}';`,
    );
  }
}
