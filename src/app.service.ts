import { Injectable, OnModuleInit } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly supabaseService: SupabaseService) {}

  async onModuleInit() {
    const client = this.supabaseService.getClient();
    
    // Intenta leer 1 solo registro de tu tabla
    const { data, error } = await client
      .from('ninera') // <--- Pon aquí el nombre de tu tabla
      .select('*')
      .limit(1);

    if (error) {
      console.error(' Error conectando a Supabase:', error.message);
    } else {
      console.log('Conexión exitosa. Datos recibidos:', data);
    }
  }

  getHello(): string {
    return '¡Servidor NestJS funcionando!';
  }
}