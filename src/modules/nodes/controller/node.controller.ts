import { AllExceptionsFilter } from '@core/filters/sequelize-exception.filter';
import { BaseResponseInterceptor } from '@core/interceptors/base-response.interceptor';
import { LoggingInterceptor } from '@core/interceptors/logging.interceptor';
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
import {
  CreateNodeRequestDto,
  NodeFilterQueryDto,
  NodeGetVModel,
  NodePaginationModel,
  NodeTreeVModel,
  UpdateNodeRequestDto,
} from '@modules/nodes/dto/node.dto';
import { NodeService } from '../services/node.service';

@ApiBearerAuth('Authorization')
@Controller({ path: 'dmn-nodes', version: '1' })
@UseInterceptors(new BaseResponseInterceptor(), new LoggingInterceptor())
@UseFilters(new AllExceptionsFilter())
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NodePaginationModel })
  async getAll(@Query() query: NodeFilterQueryDto): Promise<NodePaginationModel> {
    return this.nodeService.getAll(query);
  }

  @Get('tree')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NodeTreeVModel })
  async getAllAsTree(): Promise<NodeTreeVModel> {
    return this.nodeService.getAllAsTree();
  }

  @Get('parents/:userId')
  @HttpCode(HttpStatus.OK)
  async getParents(@Param('userId') userId: string): Promise<NodeGetVModel[]> {
    return this.nodeService.getParents(userId);
  }

  @Get('children/:userId')
  @HttpCode(HttpStatus.OK)
  async getChildren(@Param('userId') userId: string): Promise<NodeGetVModel[]> {
    return this.nodeService.getChilds(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NodeGetVModel })
  async getById(@Param('id') id: string): Promise<NodeGetVModel> {
    const node = await this.nodeService.getById(id);
    if (!node) {
      throw new NotFoundException(`Node with id ${id} not found`);
    }
    return node;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({ type: NodeGetVModel })
  async create(
    @Body() dto: CreateNodeRequestDto,
    @Req() req: Request,
  ): Promise<NodeGetVModel> {
    const actor = (req as any).user?.username ?? 'System';
    return this.nodeService.create(dto, actor);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({ type: NodeGetVModel })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNodeRequestDto,
    @Req() req: Request,
  ): Promise<NodeGetVModel> {
    const actor = (req as any).user?.username ?? 'System';
    return this.nodeService.update(id, dto, actor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const actor = (req as any).user?.username ?? 'System';
    await this.nodeService.remove(id, actor);
  }

  @Put(':id/change-status')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NodeGetVModel })
  async changeStatus(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<NodeGetVModel> {
    const actor = (req as any).user?.username ?? 'System';
    return this.nodeService.changeStatus(id, actor);
  }
}
