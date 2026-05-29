import { Module } from '@nestjs/common';
import { TryonController } from './tryon.controller';
import { TryonService } from './tryon.service';
import { AiTryonProvider } from './ai-tryon.provider';
import { AiQuotaService } from './ai-quota.service';

@Module({
  controllers: [TryonController],
  providers: [TryonService, AiTryonProvider, AiQuotaService],
  exports: [TryonService, AiQuotaService],
})
export class TryonModule {}
