import { PricingType } from '@/core/enum/pg-error-codes.enum'
import { PricingStrategyFactory } from '@shared/utils/factory'
import { HttpException, HttpStatus } from '@nestjs/common'
import * as crypto from 'crypto'
import { ICreatedOrderRequest, IOrderItems } from '../interface/order.interface'

interface ICreatedOrderEntity extends Omit<ICreatedOrderRequest, 'items'> {
  code: string
  total_amount?: number
  provisional_amount?: number
}
export class OrderBuilder {
  private order: ICreatedOrderEntity = {
    user_id: '',
    channel: '',
    code: '',
    voucher_applied: '',
    extra_data: '',
    note: '',
    discount_amount: 0,
    provisional_amount: 0,
    shipping_amount: 0,
    payment_method_id: '',
    shipping_method_id: '',
    warehouse_id: '',
    status: 'PENDING',
    shipping_address: '',
  }

  setUserId(userId: string) {
    this.order.user_id = userId
    return this
  }

  setCode(dtoItems: IOrderItems[]) {
    this.order.code = this.generateOrderCode(dtoItems)
    return this
  }

  setChannel(channel?: string) {
    this.order.channel = channel ?? ''
    return this
  }

  setVoucherApplied(voucherApplied?: string) {
    this.order.voucher_applied = voucherApplied ?? ''
    return this
  }

  setExtraData(extraData?: Record<string, any> | string) {
    this.order.extra_data = extraData ?? ''
    return this
  }

  setNote(note: string) {
    this.order.note = note
    return this
  }

  setDiscountAmount(discountAmount: number) {
    if (discountAmount < 0) {
      throw new HttpException('Discount amount cannot be negative', HttpStatus.BAD_REQUEST)
    }
    this.order.discount_amount = discountAmount
    return this
  }

  setShippingAmount(shippingAmount: number) {
    if (shippingAmount < 0) {
      throw new HttpException('Shipping amount cannot be negative', HttpStatus.BAD_REQUEST)
    }
    this.order.shipping_amount = shippingAmount
    return this
  }

  setPaymentMethodId(paymentMethodId: string) {
    this.order.payment_method_id = paymentMethodId
    return this
  }

  setShippingMethodId(shippingMethodId: string) {
    this.order.shipping_method_id = shippingMethodId
    return this
  }

  setWarehouseId(warehouseId: string) {
    this.order.warehouse_id = warehouseId
    return this
  }

  setStatus(status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | string) {
    this.order.status = status
    return this
  }

  setShippingAddress(shippingAddress: string) {
    this.order.shipping_address = shippingAddress
    return this
  }

  setProvisionalAmount(provisional_amount?: number): this {
    this.order.provisional_amount = provisional_amount
    return this
  }

  reset(): this {
    this.order = {
      code: '',
      user_id: '',
      channel: '',
      voucher_applied: '',
      extra_data: '',
      note: '',
      discount_amount: 0,
      provisional_amount: 0,
      shipping_amount: 0,
      payment_method_id: '',
      shipping_method_id: '',
      warehouse_id: '',
      status: 'PENDING',
      shipping_address: '',
    }
    return this
  }

  calculateTotalAmount(pricingType: PricingType = PricingType.NORMAL): this {
    const strategy = PricingStrategyFactory.create(pricingType)
    const totalAmount = strategy.caculatePrice({
      provisional: this.order.provisional_amount || 0,
      shipping: this.order.shipping_amount || 0,
      discount: this.order.discount_amount || 0,
    })
    this.order.total_amount = totalAmount as number
    return this
  }

  private generateOrderCode(dtoItems: IOrderItems[]): string {
    const now = new Date()
    const productIds = dtoItems.map((item) => item.product_id).join('-') || ''

    const prefix = 'ORD'
    const base = `${now}:${productIds}`
    const hash = crypto.createHash('md5').update(base).digest('hex').slice(0, 8)
    return `${prefix}-${hash.toUpperCase()}`
  }

  build(): ICreatedOrderEntity {
    return {
      user_id: this.order.user_id!,
      code: this.order.code!,
      payment_method_id: this.order.payment_method_id!,
      shipping_method_id: this.order.shipping_method_id!,
      shipping_address: this.order.shipping_address!,
      warehouse_id: this.order.warehouse_id!,
      discount_amount: this.order.discount_amount ?? 0,
      provisional_amount: this.order.provisional_amount ?? 0,
      shipping_amount: this.order.shipping_amount ?? 0,
      status: this.order.status ?? 'PENDING',
      channel: this.order.channel ?? '',
      voucher_applied: this.order.voucher_applied ?? '',
      extra_data: this.order.extra_data ?? '',
      note: this.order.note ?? '',
      total_amount: this.order.total_amount,
    }
  }
}
