import { IsNotEmpty, IsString } from 'class-validator';

export class LoginAdminDto {
  @IsNotEmpty({ message: 'El usuario es obligatorio' })
  @IsString()
  Usuario: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  Password: string;
}