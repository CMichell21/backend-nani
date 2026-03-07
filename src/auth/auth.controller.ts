import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post('signup')
  async signUp(@Body() registerDto: RegisterDto) {
    try {
      return await this.supabaseService.registrarUsuario(registerDto);
    } catch (error) {
      // Esto devuelve el error específico al frontend (ej. "User already registered")
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}