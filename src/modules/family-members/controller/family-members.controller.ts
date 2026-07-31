import { AllExceptionsFilter } from '@core/filters/sequelize-exception.filter';
import { BaseResponseInterceptor } from '@core/interceptors/base-response.interceptor';
import { LoggingInterceptor } from '@core/interceptors/logging.interceptor';
import {
  CreatedFamilyMembersRequestDto,
  FamilyMembersGetVModel,
  NodeFilterQueryDto,
  NodePaginationModel,
  NodeTreeVModel,
  UpdateNodeRequestDto,
} from '@/modules/family-members/dto/family-members.request.dto';
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
import { Request } from 'express';
import { FamilyMemberService } from '../services/family-members.service';

@ApiBearerAuth('Authorization')
@Controller({ path: 'family_members', version: '1' })
@UseInterceptors(new BaseResponseInterceptor(), new LoggingInterceptor())
@UseFilters(new AllExceptionsFilter())
export class FamilyMembersController {
  constructor(private readonly familyMemberService: FamilyMemberService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NodePaginationModel })
  async getAll(@Query() query: NodeFilterQueryDto): Promise<NodePaginationModel> {
    return this.familyMemberService.getAll(query);
  }

  @Get('tree')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NodeTreeVModel })
  async getAllAsTree(): Promise<NodeTreeVModel> {
    return this.familyMemberService.getAllAsTree();
  }

  @Get('parents/:userId')
  @HttpCode(HttpStatus.OK)
  async getParents(@Param('userId') userId: string): Promise<FamilyMembersGetVModel[]> {
    return this.familyMemberService.getParents(userId);
  }

  @Get('children/:userId')
  @HttpCode(HttpStatus.OK)
  async getChildren(@Param('userId') userId: string): Promise<FamilyMembersGetVModel[]> {
    return this.familyMemberService.getChilds(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyMembersGetVModel })
  async getById(@Param('id') id: string): Promise<FamilyMembersGetVModel> {
    const node = await this.familyMemberService.getById(id);
    if (!node) {
      throw new NotFoundException(`Node with id ${id} not found`);
    }
    return node;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({ type: FamilyMembersGetVModel })
  async create(
    @Body() dto: CreatedFamilyMembersRequestDto,
  ): Promise<FamilyMembersGetVModel> {
    return this.familyMemberService.create(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({ type: FamilyMembersGetVModel })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNodeRequestDto,
    @Req() req: Request,
  ): Promise<FamilyMembersGetVModel> {
    const actor = (req as any).user?.username ?? 'System';
    return this.familyMemberService.update(id, dto, actor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const actor = (req as any).user?.username ?? 'System';
    await this.familyMemberService.remove(id, actor);
  }

  @Put(':id/change-status')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyMembersGetVModel })
  async changeStatus(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<FamilyMembersGetVModel> {
    const actor = (req as any).user?.username ?? 'System';
    return this.familyMemberService.changeStatus(id, actor);
  }
}
