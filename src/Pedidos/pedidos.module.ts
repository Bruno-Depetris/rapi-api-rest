import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Carrito } from './Domain/Entities/carrito.entity';
import { CarritoCupon } from './Domain/Entities/carritocupon.entity';
import { CarritoItem } from './Domain/Entities/carritoitem.entity';
import { Cupon } from './Domain/Entities/cupon.entity';
import { DetallePedido } from './Domain/Entities/detallepedido.entity';
import { MetodoPago } from './Domain/Entities/metodopago.entity';
import { Pedido } from './Domain/Entities/pedido.entity';

import { CarritoRepository } from './Infrastructure/Persistence/carrito.repository';
import { CarritoCuponRepository } from './Infrastructure/Persistence/carritocupon.repository';
import { CarritoItemRepository } from './Infrastructure/Persistence/carritoitem.repository';
import { CuponRepository } from './Infrastructure/Persistence/cupon.repository';
import { DetallePedidoRepository } from './Infrastructure/Persistence/detallepedido.repository';
import { MetodoPagoRepository } from './Infrastructure/Persistence/metodopago.repository';
import { PedidoRepository } from './Infrastructure/Persistence/pedido.repository';

import { UsuarioAdapter } from './Infrastructure/Adapters/Outbound/usuario.adapter';
import { RepartidorAdapter } from './Infrastructure/Adapters/Outbound/repartidor.adapter';
import { VendedorAdapter } from './Infrastructure/Adapters/Outbound/vendedor.adapter';
import { ProductoAdapter } from './Infrastructure/Adapters/Outbound/producto.adapter';

import { CarritoController } from './Infrastructure/Adapters/Inbound/carrito.controller';
import { CuponController } from './Infrastructure/Adapters/Inbound/cupon.controller';
import { MetodoPagoController } from './Infrastructure/Adapters/Inbound/metodopago.controller';
import { PedidoController } from './Infrastructure/Adapters/Inbound/pedido.controller';

import { ObtenerCarritoUseCase } from './Application/UseCases/Carrito/obtenercarrito.usecase';
import { AgregarItemUseCase } from './Application/UseCases/Carrito/agregarItem.usecase';
import { ActualizarItemUseCase } from './Application/UseCases/Carrito/actualizarItem.usecase';
import { EliminarItemUseCase } from './Application/UseCases/Carrito/eliminarItem.usecase';
import { VaciarCarritoUseCase } from './Application/UseCases/Carrito/vaciarCarrito.usecase';
import { AplicarCuponUseCase } from './Application/UseCases/Carrito/aplicarcupon.usecase';
import { RemoverCuponUseCase } from './Application/UseCases/Carrito/removercupon.usecase';

import { CrearCuponUseCase } from './Application/UseCases/Cupon/crearcupon.usecase';
import { ObtenerCuponUseCase } from './Application/UseCases/Cupon/obtenercupon.usecase';
import { ListarCuponesActivosUseCase } from './Application/UseCases/Cupon/listarcuponesactivos.usecase';
import { ListarCuponesUseCase } from './Application/UseCases/Cupon/listarcupones.usecase';
import { ActualizarCuponUseCase } from './Application/UseCases/Cupon/actualizarcupon.usecase';
import { EliminarCuponUseCase } from './Application/UseCases/Cupon/eliminarcupon.usecase';
import { ValidarCuponUseCase } from './Application/UseCases/Cupon/validarcupon.usecase';

import { CrearMetodoPagoUseCase } from './Application/UseCases/MetodoPago/crearmetodopago.usecase';
import { ObtenerMetodoPagoUseCase } from './Application/UseCases/MetodoPago/obtenermetodopago.usecase';
import { ListarMetodosPagoUseCase } from './Application/UseCases/MetodoPago/listarmetodopago.usecase';
import { ActualizarMetodoPagoUseCase } from './Application/UseCases/MetodoPago/actualizarmetodopago.usecase';
import { EliminarMetodoPagoUseCase } from './Application/UseCases/MetodoPago/eliminarmetodopago.usecase';

import { CrearPedidoUseCase } from './Application/UseCases/Pedido/crearpedido.usecase';
import { ObtenerPedidoUseCase } from './Application/UseCases/Pedido/obtenerpedido.usecase';
import { ListarMisPedidosUseCase } from './Application/UseCases/Pedido/listarmispedidos.usecase';
import { ListarPedidosRepartidorUseCase } from './Application/UseCases/Pedido/listarpedidosrepartidor.usecase';
import { ListarPedidosAceptadosRepartidorUseCase } from './Application/UseCases/Pedido/listaraceptados.usecase';
import { ListarPedidosVendedorUseCase } from './Application/UseCases/Pedido/listarpedidosvendedor.usecase';
import { TomarPedidoUseCase } from './Application/UseCases/Pedido/tomarpedido.usecase';
import { EntregarPedidoUseCase } from './Application/UseCases/Pedido/entregarpedido.usecase';
import { CancelarPedidoUseCase } from './Application/UseCases/Pedido/cancelarpedido.usecase';

import { UsuariosModule } from '../Usuarios/usuarios.module';
import { ProductosModule } from '../Productos/productos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Carrito,
      CarritoCupon,
      CarritoItem,
      Cupon,
      DetallePedido,
      MetodoPago,
      Pedido,
    ]),
    forwardRef(() => UsuariosModule),
    forwardRef(() => ProductosModule),
  ],

  controllers: [
    CarritoController,
    CuponController,
    MetodoPagoController,
    PedidoController,
  ],

  providers: [

    CarritoRepository,
    CarritoCuponRepository,
    CarritoItemRepository,
    CuponRepository,
    DetallePedidoRepository,
    MetodoPagoRepository,
    PedidoRepository,

    UsuarioAdapter,      
    RepartidorAdapter,  
    VendedorAdapter,     
    ProductoAdapter,     


    {
      provide: 'IUsuarioPort',
      useClass: UsuarioAdapter,
    },
    {
      provide: 'IRepartidorPort',
      useClass: RepartidorAdapter,
    },
    {
      provide: 'IVendedorPort',
      useClass: VendedorAdapter,
    },
    {
      provide: 'IProductoPort',
      useClass: ProductoAdapter,
    },


    {
      provide: 'IObtenerCarritoUseCase',
      useClass: ObtenerCarritoUseCase,
    },
    {
      provide: 'IAgregarItemUseCase',
      useClass: AgregarItemUseCase,
    },
    {
      provide: 'IActualizarItemUseCase',
      useClass: ActualizarItemUseCase,
    },
    {
      provide: 'IEliminarItemUseCase',
      useClass: EliminarItemUseCase,
    },
    {
      provide: 'IVaciarCarritoUseCase',
      useClass: VaciarCarritoUseCase,
    },
    {
      provide: 'IAplicarCuponUseCase',
      useClass: AplicarCuponUseCase,
    },
    {
      provide: 'IRemoverCuponUseCase',
      useClass: RemoverCuponUseCase,
    },


    {
      provide: 'ICrearCuponUseCase',
      useClass: CrearCuponUseCase,
    },
    {
      provide: 'IObtenerCuponUseCase',
      useClass: ObtenerCuponUseCase,
    },
    {
      provide: 'IListarCuponesActivosUseCase',
      useClass: ListarCuponesActivosUseCase,
    },
    {
      provide: 'IListarCuponesUseCase',
      useClass: ListarCuponesUseCase,
    },
    {
      provide: 'IActualizarCuponUseCase',
      useClass: ActualizarCuponUseCase,
    },
    {
      provide: 'IEliminarCuponUseCase',
      useClass: EliminarCuponUseCase,
    },
    {
      provide: 'IValidarCuponUseCase',
      useClass: ValidarCuponUseCase,
    },


    {
      provide: 'ICrearMetodoPagoUseCase',
      useClass: CrearMetodoPagoUseCase,
    },
    {
      provide: 'IObtenerMetodoPagoUseCase',
      useClass: ObtenerMetodoPagoUseCase,
    },
    {
      provide: 'IListarMetodosPagoUseCase',
      useClass: ListarMetodosPagoUseCase,
    },
    {
      provide: 'IActualizarMetodoPagoUseCase',
      useClass: ActualizarMetodoPagoUseCase,
    },
    {
      provide: 'IEliminarMetodoPagoUseCase',
      useClass: EliminarMetodoPagoUseCase,
    },

    {
      provide: 'ICrearPedidoUseCase',
      useClass: CrearPedidoUseCase,
    },
    {
      provide: 'IObtenerPedidoUseCase',
      useClass: ObtenerPedidoUseCase,
    },
    {
      provide: 'IListarMisPedidosUseCase',
      useClass: ListarMisPedidosUseCase,
    },
    {
      provide: 'IListarPedidosRepartidorUseCase',
      useClass: ListarPedidosRepartidorUseCase,
    },
    {
      provide: 'IListarPedidosVendedorUseCase',
      useClass: ListarPedidosVendedorUseCase,
    },
    {
      provide: 'IListarPedidosAceptadosRepartidorUseCase',
      useClass: ListarPedidosAceptadosRepartidorUseCase,
    },
    {
      provide: 'ITomarPedidoUseCase',
      useClass: TomarPedidoUseCase,
    },
    {
      provide: 'IEntregarPedidoUseCase',
      useClass: EntregarPedidoUseCase,
    },
    {
      provide: 'ICancelarPedidoUseCase',
      useClass: CancelarPedidoUseCase,
    },
  ],

  exports: [
    CarritoRepository,
    PedidoRepository,
    CuponRepository,
    MetodoPagoRepository,
  ],
})
export class PedidosModule {}