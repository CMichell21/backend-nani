import { Module } from '@nestjs/common';
import { AuthController } from '../auth/auth.controller';
import { SupabaseService } from './supabase.service';
import { BiometriaModule } from '../biometria/biometria.module';

@Module({
  imports: [BiometriaModule],
  controllers: [AuthController], 
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}