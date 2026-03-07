export class RegisterDto {
    //datos auth
    email: string;
    password: string;

    //datos tabla persoana
    nombre: string;
    apellido: string;
    telefono: string;
    ubicacion: string;
    fecha_nacimiento: string;
    rol: 'ninera' | 'cliente';

    //url
    dni_url: string;
    foto_url: string;

    //campos ninera
    presentacion: string;
    experiencia: string;
    habilidades: string[];
    certificaciones: string[];

}