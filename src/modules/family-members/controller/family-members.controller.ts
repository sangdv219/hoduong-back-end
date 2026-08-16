import { Request } from 'express';
import { AllExceptionsFilter } from '@core/filters/sequelize-exception.filter';
import { BaseResponseInterceptor } from '@core/interceptors/base-response.interceptor';
import { LoggingInterceptor } from '@core/interceptors/logging.interceptor';
import {
  CreatedFamilyMembersRequestDto,
  FamilyMembersAsTreeDTO,
  FamilyMembersPaginationDTO,
  UpdatedFamilyMembersRequestDto,
} from '@modules/family-members/dto/family-members.request.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseFilters,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { FamilyMemberService } from '@modules/family-members/services/family-members.service';
import { GetAllFamilyMembersResponseDto } from '@modules/family-members/dto/family-members.response.dto';

@ApiBearerAuth('Authorization')
@Controller({ path: 'family-members', version: '1' })
@UseInterceptors(new BaseResponseInterceptor(), new LoggingInterceptor())
@UseFilters(new AllExceptionsFilter())
export class FamilyMembersController {
  constructor(private readonly familyMemberService: FamilyMemberService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPagination(@Query() query: FamilyMembersPaginationDTO) {
    return this.familyMemberService.searchFamilyMembers(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getFamilyMembersDetail(@Param('id') id: string){
    return this.familyMemberService.getFamilyMembersDetail(id);
    
  }

  @Post('tree')
  @HttpCode(HttpStatus.OK)
  async getAllAsTree(@Body() rootId: FamilyMembersAsTreeDTO) {
    return this.familyMemberService.getFamilyTree(rootId);
  }

  @Get('parents/:userId')
  @HttpCode(HttpStatus.OK)
  async getParents(@Param('userId') userId: string) {
    return this.familyMemberService.getParents(userId);
  }

  @Post('children/:userId')
  @HttpCode(HttpStatus.OK)
  async getChildren(@Param('userId') userId: string) {
    return this.familyMemberService.getChilds(userId);
  }
  
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createFamilyMembers(
    @Body() dto: CreatedFamilyMembersRequestDto,
  ){
    return this.familyMemberService.createFamilyMembers(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateFamilyMembers(
    @Param('id') id: string,
    @Body() dto: UpdatedFamilyMembersRequestDto,
  ) {
    // const actor = (req as any).user?.username ?? 'System';
    return this.familyMemberService.updateFamilyMembers(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const actor = (req as any).user?.username ?? 'System';
    await this.familyMemberService.remove(id, actor);
  }
}
