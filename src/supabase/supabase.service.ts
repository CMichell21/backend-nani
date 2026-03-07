import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '../auth/dto/register.dto';
import { BiometriaService } from 'src/biometria/biometria.service';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

 

  constructor(private configService: ConfigService, private biometriaService: BiometriaService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_KEY');

    if (!url || !key) {
      throw new Error('No se encontraron las credenciales de Supabase');
    }

    this.supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  // 1. Método integrado para resolver el error en app.service.ts
  getClient() {
    return this.supabase;
  }

  async registrarUsuario(datos: RegisterDto) {
    const client = this.supabase;

    // 2. Registro en Supabase Auth con validación de nulidad para evitar errores de tipos
    const { data: authData, error: authError } = await client.auth.signUp({
      email: datos.email,
      password: datos.password,
    });

    if (authError || !authData?.user) {
      throw new Error(`Error en Auth: ${authError?.message || 'Usuario no creado'}`);
    }

    const authUserId = authData.user.id;

    // 3. Inserción en tabla 'usuario' 
    const { data: userData, error: userError } = await client
      .from('usuario')
      .insert({
        auth_id: authUserId,
        correo: datos.email,
        rol: datos.rol,
        fecha_registro: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError || !userData) {
      throw new Error(`Error en tabla Usuario: ${userError?.message}`);
    }

    // 4. Inserción en tabla 'persona'
    const { data: personaData, error: personaError } = await client
      .from('persona')
      .insert({
        id: authUserId,
        nombre: datos.nombre,
        apellido: datos.apellido,
        telefono: datos.telefono,
        ubicacion: datos.ubicacion,
        verificacion_biometrica: false,
        fecha_nacimiento: datos.fecha_nacimiento,

      })
      .select()
      .single();

    if (personaError || !personaData) {
      throw new Error(`Error en tabla Persona: ${personaError?.message}`);
    }

    // 5. Lógica específica según el ROL (Niñera o Cliente)
    if (datos.rol === 'ninera') {
      const { data: nineraData, error: nineraError } = await client
        .from('ninera')
        .insert({
          persona_id: personaData.id,
          usuario_id: userData.id,
          presentacion: datos.presentacion || '',
          experiencia: datos.experiencia || '',
          verificada: false,
        })
        .select()
        .single();

      if (nineraError || !nineraData) {
        throw new Error(`Error en perfil niñera: ${nineraError?.message}`);
      }

     
      const subInserts: any[] = [];

      if (datos.habilidades && datos.habilidades.length > 0) {
        subInserts.push(
          client.from('habilidad_ninera').insert(
            datos.habilidades.map(h => ({ 
              ninera_id: nineraData.id, 
              nombre: h 
            }))
          )
        );
      }

      if (datos.certificaciones && datos.certificaciones.length > 0) {
        subInserts.push(
          client.from('certificaciones_ninera').insert(
            datos.certificaciones.map(c => ({ 
              ninera_id: nineraData.id, 
              nombre: c 
            }))
          )
        );
      }

      if (subInserts.length > 0) {
        await Promise.all(subInserts);
      }
    } 
    
    else if (datos.rol === 'cliente') {
      const { error: clienteError } = await client.from('cliente').insert({
        persona_id: personaData.id,
        usuario_id: userData.id,
      });
      if (clienteError) throw new Error(`Error en perfil cliente: ${clienteError.message}`);
    }

    return {
      message: 'Usuario registrado exitosamente en Nani',
      userId: authUserId,
    };
  }

  async registrarConBiometria(datos: any) {  //subir foto
  
    const urlDni = datos.dni_url;
    const urlSelfie= datos.foto_instante;
    const similitud = await this.biometriaService.compararRostros(urlDni, urlSelfie);
    const client = this.supabase
     if (similitud > 0.8) { //umbral
       
       console.log('verificacion correcta');
       
       const{error:updateError}=await client
         .from('persona')
         .update({verificacion_biometrica: true})
         .eq('id', datos.auth_id);
        if (updateError) throw new Error ('error al actualizar: ${updateError.message}');

     } else {
      console.log('No es la misma');
     }

     const { error: verificacionError } = await client
        .from('verificacion_biometrica')
        .insert({
          persona_id: datos.auth_id,
          tipo_documento: 'DNI',
          dni_url: urlDni,
          resultado_similitud: similitud,
          created_at: new Date().toISOString()
        });
     if(verificacionError){
      console.error('Error al guardar:', verificacionError)
     }
  }
}