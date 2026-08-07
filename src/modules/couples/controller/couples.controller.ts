import { AllExceptionsFilter } from '@core/filters/sequelize-exception.filter';
import { BaseResponseInterceptor } from '@core/interceptors/base-response.interceptor';
import { LoggingInterceptor } from '@core/interceptors/logging.interceptor';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { CouplesPaginationDTO, CreatedCouplesRequestDto, UpdatedCouplesRequestDto } from '@modules/couples/dto/couples.request.dto';
import { CoupleService } from '@modules/couples/services/couples.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { BaseGetResponse } from '@shared/interface/common';
import { GetByIdCouplesResponseDto } from '../dto/couples.response.dto';
import { CouplesModel } from '@/infrastructure/models/couples.model';

@ApiBearerAuth('Authorization')
@Controller({ path:'couples', version: '1' })
@UseInterceptors(new BaseResponseInterceptor(), new LoggingInterceptor())
@UseFilters(new AllExceptionsFilter())
export class CouplesController {
  constructor(
    private readonly coupleService: CoupleService,
  ) { }

  @ApiOkResponse({ description: 'Danh sách couples phân trang', type: BaseGetResponse<CouplesModel> })
  @Get()
  @HttpCode(HttpStatus.OK)
  // @UseGuards(JWTAuthGuard)
  async getPagination(@Query() query: CouplesPaginationDTO): Promise<GetByIdCouplesResponseDto> {
    try {
      return this.coupleService.searchCouples(query);
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  // @UseGuards(JWTAuthGuard)
  async getById(@Param('id') id: string): Promise<GetByIdCouplesResponseDto | null> {
    try {
      return await this.coupleService.getCouplesById(id);
    } catch (error) {
      throw error;
    }
  }
  
  @HttpCode(HttpStatus.CREATED)
  // @UseGuards(JWTAuthGuard)
  // @UseInterceptors(couplesContextInterceptor)
  @Post()
  @ApiOkResponse({ description: 'Create new couples', type: CreatedCouplesRequestDto })
  async create(@Body() dto: CreatedCouplesRequestDto): Promise<any> {
    return await this.coupleService.create(dto);
  }
  
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(JWTAuthGuard)
  // @UseInterceptors(couplesContextInterceptor)
  async updateCouples(@Param('id') id: string, @Body() dto: UpdatedCouplesRequestDto) {
    try {
      return await this.coupleService.update(id, dto);
    } catch (error) {
      throw error;
    }
  }
}
