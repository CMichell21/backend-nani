import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import * as faceapi from 'face-api.js';
import * as path from 'path';

// Configuramos monkey patching para que face-api funcione en Node.js sin navegador
const canvas = require('canvas');
const { Canvas, Image, ImageData} = require('canvas');
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

@Injectable()
export class BiometriaService implements OnModuleInit {
  
  async onModuleInit() {
    // Cargamos los modelos desde la carpeta que creaste
    const modelPath = path.join(process.cwd(), 'dist','biometria','models');
    
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    
    console.log('Modelos de Biometría de NANI cargados');
  }

  async compararRostros(urlDni: string, urlSelfie: string): Promise<number> {
    try {
      // 1. Cargamos las imágenes desde los URLs de Supabase
      const imgDni = await canvas.loadImage(urlDni);
      const imgSelfie = await canvas.loadImage(urlSelfie);

      // 2. Detectamos los rostros y sus "huellas digitales" (descriptores)
      const deteccionDni = await faceapi.detectSingleFace(imgDni as any)
        .withFaceLandmarks()
        .withFaceDescriptor();

      const deteccionSelfie = await faceapi.detectSingleFace(imgSelfie as any)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!deteccionDni || !deteccionSelfie) {
        throw new Error('No se detectó rostro en una de las imágenes');
      }

      // 3. Comparamos las dos caras (Distancia Euclidiana)
      const faceMatcher = new faceapi.FaceMatcher(deteccionDni);
      const bestMatch = faceMatcher.findBestMatch(deteccionSelfie.descriptor);

      // Retornamos el porcentaje de similitud (1 - distancia)
      return (1 - bestMatch.distance); 
    } catch (error) {
      console.error('Error en comparación biométrica:', error.message);
      throw new InternalServerErrorException('Error al procesar el reconocimiento facial');
    }
  }
}