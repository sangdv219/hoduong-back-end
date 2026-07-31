import { AllExceptionsFilter } from '@core/filters/sequelize-exception.filter';
import { BaseResponseInterceptor } from '@core/interceptors/base-response.interceptor';
import { LoggingInterceptor } from '@core/interceptors/logging.interceptor';
import { RolesService } from '@modules/roles/services/roles.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
  Version
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { PaginationQueryDto } from '@shared/dto/common';
import { CreatedRolesRequestDto, UpdatedRolesRequestDto } from '@modules/roles/dto/role.request.dto';
import { GetAllRoleResponseDto, GetByIdRoleResponseDto } from '@modules/roles/dto/role.response.dto';
import { BaseGetResponse } from '@shared/interface/common';
import { RolesModel } from '@infrastructure/models/roles.model';
import { JWTAuthGuard } from '@core/guards/jwt.guard';
import { UserContextInterceptor } from '@core/interceptors/user-context.interceptor';

@ApiBearerAuth('Authorization')
@Controller({ path: 'roles', version: '1' })
@UseInterceptors(new BaseResponseInterceptor(), new LoggingInterceptor())
@UseFilters(new AllExceptionsFilter())
export class RolesController {
  private readonly logger = new Logger(RolesController.name);
  constructor(
    private readonly roleService: RolesService
  ) { }

  @Get()
  @ApiOkResponse({ description: 'Danh sách role phân trang', type: BaseGetResponse<RolesModel> })
  @HttpCode(HttpStatus.OK)
  // @UseGuards(JWTAuthGuard)
  async getPagination(@Query() query: PaginationQueryDto): Promise<GetAllRoleResponseDto> {
    try {
      return await this.roleService.getPagination(query);
    } catch (error) {
      throw error;
    }
  }

  
  // @Get(':id')
  // @Version('1')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JWTAuthGuard)
  // async getRoleById(@Param('id') id: string): Promise<GetByIdRoleResponseDto | null> {
  //   try {      
  //     return await this.roleService.getById(id);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // @UseGuards(JWTAuthGuard)
  // @UseInterceptors(UserContextInterceptor)
  async create(@Body() createRolesDto: CreatedRolesRequestDto) {
    try {
      return await this.roleService.create(createRolesDto);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(UserContextInterceptor)
  async updateRole(@Param('id') id: string, @Body() dto: UpdatedRolesRequestDto) {
    try {
      return await this.roleService.update(id, dto);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(UserContextInterceptor)
  async deleteRole(@Param('id') id: string): Promise<void> {
    try {
      return await this.roleService.delete(id);
    } catch (error) {
      throw error;
    }
  }
}
