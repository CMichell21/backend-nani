import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module'; // Asegúrate que la ruta sea correcta

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Carga el .env para toda la app
    SupabaseModule, // Importa tu módulo de Supabase
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}