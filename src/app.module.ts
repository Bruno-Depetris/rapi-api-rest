import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './Usuarios/usuarios.module';
import { NegociosModule } from './Negocios/negocios.module';
import { ProductosModule } from './Productos/productos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, 
        logging: configService.get('DB_LOGGING', true), 
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UsuariosModule,
    NegociosModule,
    ProductosModule,
  ],
  providers: [AppService],
})
export class AppModule {}