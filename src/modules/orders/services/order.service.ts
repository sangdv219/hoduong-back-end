// import { PricingStrategyFactory } from '@/shared/utils/factory'
// import { BullService } from '@bull/bull.service'
// import { DoublyLinkedList } from '@core/data-structures/doubly-linked-list'
// import { SinglyLinkedList } from '@core/data-structures/singly-linked-list'
// import { PricingType } from '@core/enum/pg-error-codes.enum'
// import { BaseService } from '@core/services/base.service'
// import { ORDER_ENTITY } from '@modules/orders/constants/order.constant'
// import {
//   CreatedOrderRequestDto,
//   UpdatedOrderRequestDto,
// } from '@modules/orders/dto/order.request.dto'
// import {
//   GetAllOrderResponseDto,
//   GetByIdOrderResponseDto,
// } from '@modules/orders/dto/order.response.dto'

// import {
//   ICreatedOrderRequest,
//   IOrder,
//   IOrderItems,
// } from '@modules/orders/interface/order.interface'
// import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common'
// import { EventEmitter2 } from '@nestjs/event-emitter'
// import { InjectConnection } from '@nestjs/sequelize'
// import { RedisService } from '@redis/redis.service'
// import { plainToInstance } from 'class-transformer'
// import * as crypto from 'crypto'
// import { QueryTypes, Sequelize, Transaction } from 'sequelize'
// import { OrderBuilder } from '../builder/order.builder'

// @Injectable()
// export class OrderService extends BaseService<
//   OrdersModel,
//   CreatedOrderRequestDto,
//   UpdatedOrderRequestDto,
//   GetByIdOrderResponseDto,
//   GetAllOrderResponseDto
// > {
//   protected entityName: string
//   private Orders: string[] = []
//   private orderBuilder: OrderBuilder


//   protected async moduleInit() {
//     // Logger.log('✅ Init Order cache...');
//   }

//   protected async bootstrapLogic(): Promise<void> {
//     // Logger.log(
//     //   '👉 OnApplicationBootstrap: OrderService bootstrap: preloading cache...',
//     // );
//     //Bắt đầu chạy cron job đồng bộ tồn kho.
//     //* Gửi log "App ready" cho monitoring system.
//   }

//   protected async beforeAppShutDown(signal): Promise<void> {
//     this.stopJob()
//     Logger.log(`🛑 beforeApplicationShutdown: OrderService cleanup before shutdown.`)
//   }

//   private async stopJob() {
//     Logger.log('logic dừng cron job: ')
//     Logger.log('* Ngắt kết nối queue worker: ', OrderService.name)
//   }

//   protected async moduleDestroy() {
//     this.Orders = []
//     Logger.log('onModuleDestroy -> Orders: ', this.Orders)
//   }

//   async checkout(dto: CreatedOrderRequestDto) {
//     this.cleanCacheRedis()

//     await this.bullService.addOrderJob(dto)

//     // return {
//     //   jobId: job.jobId
//     // };
//   }

//   // async implementsOrder(dto: CreatedOrderRequestDto) {
//   //   const orderItems: IOrderItems[] = dto.items
//   //   orderItems.sort((a, b) => a.product_id.localeCompare(b.product_id))
//   //   const productIds = orderItems.map((item) => item.product_id)
//   //   const products = await this.productRepository.findAllByRaw({
//   //     where: { id: productIds },
//   //     attributes: ['id', 'promotion_price', 'price'],
//   //   })

//   //   return await this.sequelize.transaction(async (t: Transaction) => {
//   //     const orderItemPayloads: IOrderItems[] = []

//   //     const productMap = new Map<string, IProduct>(
//   //       products.map((p) => [p.id, p, p.price, p.promotion_price]),
//   //     )
//   //     let orderSubTotal = 0
//   //     for (const oi of orderItems) {
//   //       if (productMap.has(oi.product_id) === false) {
//   //         throw new NotFoundException(`Product with ID ${oi.product_id} not found!`)
//   //       } else {
//   //         await this.lockAndCheckInventory(oi.product_id, oi.quantity, t)
//   //         await this.decreaseStockInventory(oi.product_id, oi.quantity, t)

//   //         const product: IProduct = productMap.get(oi.product_id)!
//   //         const vatAmount = oi.vat ? product.promotion_price! * 1.1 : product.promotion_price
//   //         const subTotal = vatAmount * oi.quantity

//   //         orderSubTotal += subTotal

//   //         orderItemPayloads.push({
//   //           product_id: oi.product_id,
//   //           discount: oi.discount,
//   //           quantity: oi.quantity,
//   //           vat: oi.vat,
//   //           note: oi.note,
//   //           tax_code: oi.tax_code,
//   //           promotion_price: product.promotion_price,
//   //           original_price: product.price,
//   //           final_price: subTotal,
//   //         })
//   //       }
//   //     }

//   //     const updatedProvisionalAmount = { provisional_amount: orderSubTotal, ...dto }
//   //     const order = await this.insertOrdersTable(updatedProvisionalAmount, t)
//   //     const orderId: string = order.id

//   //     for (const item of orderItemPayloads) {
//   //       item.order_id = orderId
//   //     }

//   //     await this.orderItemsRepository.bulkCreate(orderItemPayloads, { transaction: t })

//   //     await this.orderHistoryRepository.create(
//   //       {
//   //         order_id: orderId,
//   //         user_id: dto.user_id,
//   //         order_total: orderSubTotal,
//   //         items_json: JSON.stringify(orderItemPayloads),
//   //       },
//   //       { transaction: t },
//   //     )
//   //   })
//   // }

//   async lockAndCheckInventory(productId: string, quantity: number, t: Transaction) {
//     const rows = await this.sequelize.query(
//       `SELECT stock 
//           FROM inventory 
//           WHERE product_id = :productId 
//           FOR UPDATE`,
//       {
//         replacements: { productId: productId },
//         transaction: t,
//         type: QueryTypes.SELECT,
//         plain: true,
//       },
//     )

//     if (!rows) throw new NotFoundException('Product not found in inventory')
//     if (rows['stock'] < quantity) {
//       throw new HttpException('Not enough stock', HttpStatus.CONFLICT)
//     }
//   }

//   async decreaseStockInventory(productId: string, quantity: number, t: Transaction) {
//     const [result] = await this.sequelize.query(
//       `UPDATE inventory
//            SET stock = stock - :quantity
//            WHERE product_id = :productId
//            AND stock >= :quantity
//            RETURNING stock`,
//       {
//         replacements: { productId: productId, quantity: quantity },
//         transaction: t,
//         type: QueryTypes.UPDATE,
//         plain: true,
//       },
//     )

//     if (!result) {
//       throw new HttpException('Not enough stock to decrease', HttpStatus.CONFLICT)
//     }
//   }

//   async insertOrdersTable(dto: ICreatedOrderRequest, t: Transaction): Promise<any> {
//     const orderEntity = new OrderBuilder()
//       .setUserId(dto.user_id)
//       .setCode(dto.items)
//       .setPaymentMethodId(dto.payment_method_id)
//       .setShippingMethodId(dto.shipping_method_id)
//       .setShippingAddress(dto.shipping_address)
//       .setWarehouseId(dto.warehouse_id)
//       .setDiscountAmount(dto.discount_amount)
//       .setShippingAmount(dto.shipping_amount)
//       .setStatus(dto.status)
//       .setChannel(dto.channel)
//       .setVoucherApplied(dto.voucher_applied)
//       .setExtraData(dto.extra_data)
//       .setNote(dto.note)
//       .setProvisionalAmount(dto.provisional_amount) // Auto-calculate from items
//       .calculateTotalAmount(PricingType.NORMAL)
//       .build()

//     Logger.log('orderEntity:', orderEntity)
//     const createdOrder = await this.orderRepository.create(orderEntity, { transaction: t })
//     return createdOrder
//   }

//   async calculatorOrder(idOrderItem: string, order_id: string, t: Transaction) {
//     await this.sequelize.query(
//       `UPDATE orders
//          SET subtotal = subtotal - (
//               SELECT final_price
//               FROM order_items
//               WHERE id = :id
//             ),
//             total_amount = total_amount - (
//               SELECT final_price
//               FROM order_items
//               WHERE id = :id 
//             )
//             WHERE id=:orderId;
            
//             DELETE FROM orders
//             WHERE id = :orderId
//             AND subtotal = 0;`,
//       {
//         replacements: { orderId: order_id, id: idOrderItem },
//         transaction: t,
//       },
//     )
//   }

//   async destroyRowOrderItems(idOrderItem: string, t: Transaction) {
//     await this.sequelize.query(
//       `DELETE FROM order_items
//        WHERE id=:id`,
//       {
//         replacements: { id: idOrderItem },
//         transaction: t,
//       },
//     )
//   }

//   generateOrderCode(recent: Date, productId: string): string {
//     const prefix = 'ORD'
//     const base = `${recent}:${productId}`
//     const hash = crypto.createHash('md5').update(base).digest('hex').slice(0, 8)
//     return `${prefix}-${hash.toUpperCase()}`
//   }

//   async deleteOrderItems(id: string) {
//     this.cleanCacheRedis()
//     return await this.sequelize.transaction(async (t: Transaction) => {
//       const orderItems = await this.orderItemsRepository.findByPk(id)
//       if (!orderItems) throw new NotFoundException('OrderItems not found!')
//       // const { order_id } = orderItems || {}
//       // await this.calculatorOrder(id, order_id, t)
//       // await this.destroyRowOrderItems(id, t)
//     })
//   }

//   // async getOrderByIdv2(id: string) {
//   //   const products = await this.orderItemsRepository.findByFields('order_id', id, ['quantity', 'price', 'discount', 'final_price', 'note']);

//   //   const order = await this.orderRepository.findByOneByRaw({
//   //     where: { id },
//   //     include: [{
//   //       model: UserEntity,
//   //       // attributes: {exclude: ['password_hash', 'created_by']}
//   //       attributes: ['name', 'email', 'phone', 'age', 'gender']
//   //     },
//   //     ],
//   //     raw: true,
//   //     nest: true
//   //   })
//   //   order['products'] = products
//   //   return plainToInstance<GetByIdOrderResponseDtoV2, any>(GetByIdOrderResponseDtoV2, order, { excludeExtraneousValues: true });
//   // }

//   // @OnEvent('auth.login')
//   // async getRevenue() {
//   //   Logger.log('====>getRevenue:');

//   //   const SequelizeQuery = await this.orderRepository.findAllByRaw({
//   //     attributes: [
//   //       'id',
//   //       [Sequelize.col('user.name'), 'name'],
//   //       [Sequelize.fn('SUM', Sequelize.col('orderItems.final_price')), 'total_price'],
//   //       [Sequelize.fn('COUNT',
//   //         Sequelize.fn('DISTINCT', Sequelize.col('OrdersModel.id'))
//   //       ),
//   //         'total_order'
//   //       ],
//   //     ],
//   //     include: [
//   //       {
//   //         model: UserEntity,
//   //         attributes: [],
//   //       },
//   //       {
//   //         model: OrderItemsModel,
//   //         attributes: [],
//   //       }
//   //     ],
//   //     group: ['OrdersModel.id', 'user.name'],
//   //   })

//   //   const rawQuery = await this.sequelize.query(
//   //     `SELECT o.id, u.name,
//   //     SUM(oi.final_price) AS total_price,
//   //     COUNT(DISTINCT o.id) AS total_order
//   //     FROM public.orders o
//   //     JOIN public.users u ON u.id = o.user_id
//   //     JOIN public.order_items oi ON oi.order_id = o.id
//   //     GROUP BY o.id, u.name;`
//   //   )

//   //   return rawQuery;
//   // }

//   // async getById(id: string): Promise<GetByIdOrderResponseDto> {
//   //   const Order = await this.orderRepository.findByPk(id)
//   //   if (!Order) throw new TypeError('Order not found')
//   //   const OrderId = Order.id
//   //   const products = await this.productRepository.findOneByField('id', OrderId)
//   //   Order['products'] = products
//   //   const dto = plainToInstance(GetByIdOrderResponseDto, Order, { excludeExtraneousValues: true })
//   //   return dto
//   // }

//   excuteDoublyList() {
//     const start = process.hrtime.bigint()

//     // Thực thi thuật toán
//     // expensiveTask();
//     // for (let i = 0; i < 4000000000; i++) {
//     //   Math.sqrt(i);
//     // }
//     const a = new SinglyLinkedList<number>()
//     const b = new DoublyLinkedList<number>()
//     for (let i = 0; i < 1000; i++) {
//       a.append(i)
//       // b.append(i);
//     }
//     a.getTail()
//     // b.display();
//     Logger.log(`Kích thước danh sách liên kết đơn: ${a.getHead()?.data}`)
//     // Logger.log(`Kích thước danh sách liên kết đôi: ${b.getSize()}`);
//     const end = process.hrtime.bigint()
//     // Kết quả trả về là kiểu BigInt (tính bằng nanoseconds)
//     const durationInMs = Number(end - start) / 1_000_000
//     const durationInMs2 = Number(end - start) / 1_000_000_000
//     Logger.log(`Thời gian thực thi bằng nano giây: ${durationInMs} ms`)
//     Logger.log(`Thời gian thực thi bằng giây: ${durationInMs2.toFixed(2)} s`)

//     return { message: 'This is excuteDoublyList' }
//   }
// }
