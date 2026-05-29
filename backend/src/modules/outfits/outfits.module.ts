import { Module } from '@nestjs/common';
import { OutfitsController } from './outfits.controller';
import { OutfitsService } from './outfits.service';
import { RecommendationService } from './recommendation.service';
import { TryonModule } from '../tryon/tryon.module';

@Module({
  imports: [TryonModule],
  controllers: [OutfitsController],
  providers: [OutfitsService, RecommendationService],
  exports: [OutfitsService],
})
export class OutfitsModule {}
