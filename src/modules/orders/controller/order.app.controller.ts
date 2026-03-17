import { Action } from '@core/decorators/action.decorator';
import { Resource } from '@core/decorators/resource.decorator';
import { AllExceptionsFilter } from '@core/filters/sequelize-exception.filter';
import { JWTAuthGuard } from '@core/guards/jwt.guard';
import { RbacGuard } from '@core/guards/rbac.guard';
import { BaseResponseInterceptor } from '@core/interceptors/base-response.interceptor';
import { LoggingInterceptor } from '@core/interceptors/logging.interceptor';
import { CreatedOrderRequestDto, UpdatedOrderRequestDto } from '@modules/orders/dto/order.request.dto';
import { GetAllOrderResponseDto, GetByIdOrderResponseDto } from '@modules/orders/dto/order.response.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
  Version
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PaginationQueryDto } from '@shared/dto/common';

@ApiBearerAuth('Authorization')
@Controller({ path: 'app/orders', version: '1' })
@UseInterceptors(new BaseResponseInterceptor(), new LoggingInterceptor())
@UseFilters(new AllExceptionsFilter())
export class OrderAppController {
  constructor(
    // private readonly orderService: OrderService
  ) { }

  // @Get()
  // @Resource('orders')
  // @Action('read')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JWTAuthGuard, RbacGuard)
  // @CacheTTL(60)
  // async getPagination(@Query() query: PaginationQueryDto): Promise<GetAllOrderResponseDto> {
  //   try {
  //     return await this.orderService.getPagination(query);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // @Version('1')
  // @UseGuards(JWTAuthGuard, RbacGuard)
  // @Get('getRevenue')
  // @Resource('order:revenue')
  // @Action('read')
  // @HttpCode(HttpStatus.OK)
  // @CacheTTL(60)
  // async getRevenue(): Promise<unknown> {
  //   try {
  //     return await this.orderService.getRevenue();
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // @Version('1')
  // @Get(':id')
  // async getOrderById(@Param('id') id: string): Promise<GetByIdOrderResponseDto | null> {
  //   try {
  //     return await this.orderService.getById(id);
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  
  // @Version('2')
  // @Get(':id')
  // async getOrderByIdv2(@Param('id') id: string): Promise<GetByIdOrderResponseDtoV2 | null> {
  //   try {
  //     return await this.orderService.getOrderByIdv2(id);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // @HttpCode(HttpStatus.CREATED)
  // @Post('checkout')
  // async checkout(@Body() createOrderDto: CreatedOrderRequestDto) {
  //   try {
  //     return await this.orderService.checkout(createOrderDto);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // @Patch(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async updateOrder(@Param('id') id: string, @Body() dto: UpdatedOrderRequestDto) {
  //   try {
  //     return await this.orderService.update(id, dto);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteOrder(@Param('id') id: string): Promise<void> {
  //   try {
  //     return await this.orderService.delete(id);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // @Delete('removeOrderItems/:id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteOrderItems(@Param('id') id: string): Promise<void> {
  //   try {
  //     return await this.orderService.deleteOrderItems(id);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // @Version('99')
  // @Get('ExcuteDoublyList')
  // async ExcuteDoublyList() {
  //   try {
  //     return await this.orderService.excuteDoublyList();
  //   } catch (error) {
  //     throw error;
  //   }
  // }


}
