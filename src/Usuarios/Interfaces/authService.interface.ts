import { RegisterDto } from '../DTOs/register.dto';
import { LoginDto } from '../DTOs/login.dto';
import { LoginAdminDto } from '../DTOs/loginAdmin.dto';

export interface IAuthService {
  /**
   * 
   * @param registerDto 
   * @returns 
   */
  register(registerDto: RegisterDto): Promise<{
    message: string;
    user: {
      usuarioId: number;
      nombre: string;
      email: string;
      rol: string;
      direccion: string | null;
    };
  }>;

  /**
   * 
   * @param loginDto 
   * @returns 
   */
  login(loginDto: LoginDto): Promise<{
    access_token: string;
    user: {
      usuarioId: number;
      nombre: string;
      email: string;
      rol: string;
      direccion: string | null;
      [key: string]: any; 
    };
  }>;

  /**
   * 
   * @param loginAdminDto 
   * @returns 
   */
  loginAdmin(loginAdminDto: LoginAdminDto): Promise<{
    access_token: string;
    admin: {
      adminId: number;
      usuario: string;
    };
  }>;

  /**
   * 
   * @param token 
   */
  validateToken(token: string): Promise<{
    valid: boolean;
    payload: any;
  }>;
}