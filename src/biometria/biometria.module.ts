import { Module } from '@nestjs/common';
import { BiometriaService } from './biometria.service';

@Module({
  providers: [BiometriaService],
  exports: [BiometriaService], // Muy importante para que otros servicios lo usen
})
export class BiometriaModule {}