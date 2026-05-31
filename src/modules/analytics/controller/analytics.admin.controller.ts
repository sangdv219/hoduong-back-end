import { PaginationQueryDto } from '@shared/dto/common';
import { AllExceptionsFilter } from '@core/filters/sequelize-exception.filter';
import { JWTAuthGuard } from '@core/guards/jwt.guard';
import { BaseResponseInterceptor } from '@core/interceptors/base-response.interceptor';
import { LoggingInterceptor } from '@core/interceptors/logging.interceptor';
// import { AnalyticsService } from '@modules/analytics/services/analytics.service';
import { CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

// @ApiBearerAuth('Authorization')
// @Controller({ path:'admin/analytics', version: '1' })
// @UseInterceptors(new BaseResponseInterceptor(), new LoggingInterceptor())
// @UseFilters(new AllExceptionsFilter())
// export class AnalyticsAdminController {
//   constructor(private readonly categoryService: AnalyticsService) { }

//   @Get('users/product-diversity')
//   @UseGuards(JWTAuthGuard)
//   @HttpCode(HttpStatus.OK)
//   @CacheTTL(60)
//   async analyticsDiversity(@Query() query: PaginationQueryDto): Promise<any> {
//     try {
//       return await this.categoryService.analyticsDiversity(query);
//     } catch (error) {
//       throw error;
//     }
//   }

// }
