import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { SupabaseService } from './supabase/supabase.service'; // Importante

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabaseService: SupabaseService // Inyectamos el servicio aquí
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('biometria-test')
  async probarBiometria(@Body() body: any) {
    return await this.supabaseService.registrarConBiometria(body);
  }
}