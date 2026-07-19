import { AllExceptionsFilter } from '@core/filters/sequelize-exception.filter';
import { BaseResponseInterceptor } from '@core/interceptors/base-response.interceptor';
import { LoggingInterceptor } from '@core/interceptors/logging.interceptor';
import { PaginationQueryDto } from '@shared/dto/common';
import { BaseGetResponse } from '@shared/interface/common';
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
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { CreatedUserAdminRequestDto, UpdatedUserAdminRequestDto, UserPaginationDTO } from '@modules/users/dto/user.admin.request.dto';
import { UserEntity } from '@infrastructure/models/user.model';
import { UserService } from '@modules/users/services/user.service';
import { GetAllUserAdminResponseDto, GetByIdUserAdminResponseDto } from '@modules/users/dto/user.admin.response.dto';
import { JWTAuthGuard } from '@core/guards/jwt.guard';
import { UserContextInterceptor } from '@core/interceptors/user-context.interceptor';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { RegisterUserUseCase } from '@modules/users/use-cases/sign-up/signup.use-case';
import { CreateUserUseCase } from '@modules/users/use-cases/create-user/create-user.use-case';

@ApiBearerAuth('Authorization')
@Controller({ path:'user-admin', version: '1' })
@UseInterceptors(new BaseResponseInterceptor(), new LoggingInterceptor())
@UseFilters(new AllExceptionsFilter())
export class UserAdminController {
  constructor(
    private readonly userService: UserService,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
  ) { }

  @ApiOkResponse({ description: 'Danh sách user phân trang', type: BaseGetResponse<UserEntity> })
  @Get()
  @HttpCode(HttpStatus.OK)
  // @UseGuards(JWTAuthGuard)
  async getPagination(@Query() query: UserPaginationDTO): Promise<GetAllUserAdminResponseDto> {
    try {
      return this.userService.searchUser(query);
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  // @UseGuards(JWTAuthGuard)
  async getUserAdminById(@Param('id') id: string): Promise<GetByIdUserAdminResponseDto | null> {
    try {
      return await this.userService.getById(id);
    } catch (error) {
      throw error;
    }
  }

  @Post('register')
  @Version('3')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() body: RegisterDto): Promise<void> {
    return await this.registerUserUseCase.execute(body);
  }
  
  @Get('getRolePermissionByUserId/:id')
  // @UseGuards(JWTAuthGuard)
  async getRolePermissionByUserId(@Param('id') id: string): Promise<any | null> {
    try {
      return await this.userService.getRolePermissionByUserId(id);
    } catch (error) {
      throw error;
    }
  }
  
  @HttpCode(HttpStatus.CREATED)
  // @UseGuards(JWTAuthGuard)
  // @UseInterceptors(UserContextInterceptor)
  @Post()
  @ApiOkResponse({ description: 'Create new member', type: CreatedUserAdminRequestDto })
  async create(@Body() dto: CreatedUserAdminRequestDto): Promise<any> {
    return await this.createUserUseCase.execute(dto);
  }
  
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(JWTAuthGuard)
  // @UseInterceptors(UserContextInterceptor)
  async updateUserAdmin(@Param('id') id: string, @Body() dto: UpdatedUserAdminRequestDto) {
    try {
      return await this.userService.update(id, dto);
    } catch (error) {
      throw error;
    }
  }
  
  @Delete(':id')
  @HttpCode(HttpStatus.CREATED)
  // @UseGuards(JWTAuthGuard)
  // @UseInterceptors(UserContextInterceptor)
  async deleteUserAdmin(@Param('id') id: string): Promise<void> {
    try {
      return await this.userService.delete(id);
    } catch (error) {
      console.log("error: ", error);
      throw error;
    }
  }
  
  @Patch('/restore/:id')
  // @UseGuards(JWTAuthGuard)
  // @UseInterceptors(UserContextInterceptor)
  @HttpCode(HttpStatus.NO_CONTENT)
  async restoreUserAdmin(@Param('id') id: string): Promise<any> {
    return await this.userService.restoreUser(id);
  }
}
