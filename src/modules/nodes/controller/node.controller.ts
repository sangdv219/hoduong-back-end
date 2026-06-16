import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Body, 
    Param, 
    Query, 
    HttpStatus, 
    HttpCode, 
    NotFoundException, 
    BadRequestException,
    UsePipes,
    ValidationPipe,
    Req
  } from '@nestjs/common';
  import { Request } from 'express';
import { NodeService } from '../services/node.service';

  
  /**
   * Controller chịu trách nhiệm định tuyến và xử lý các yêu cầu HTTP liên quan đến Nút Gia Phả (DmnNode)
   */
  @Controller('api/dmn-nodes')
  export class DmnNodeController {
    constructor(private readonly nodeService: NodeService) {}
  
    /**
     * Lấy danh sách tất cả các Node kèm phân trang và bộ lọc động
     * GET /api/dmn-nodes
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(
      @Query() queryParams: any,
      @Req() req: Request
    ): Promise<PaginationModel<DmnNodeGetVModel>> {
      // Chuyển đổi và chuẩn hóa kiểu dữ liệu từ query string gửi lên
      const filterParams: DmnNodeFilterParams = {
        pageNumber: queryParams.pageNumber ? Number(queryParams.pageNumber) : 1,
        pageSize: queryParams.pageSize ? Number(queryParams.pageSize) : 10,
        keyword: queryParams.keyword || undefined,
        parentId: queryParams.parentId ? Number(queryParams.parentId) : undefined,
        isActive: queryParams.isActive !== undefined ? queryParams.isActive === 'true' : undefined,
        createdBy: queryParams.createdBy || undefined,
        updatedBy: queryParams.updatedBy || undefined,
        createdDate: queryParams.createdDate ? new Date(queryParams.createdDate) : undefined,
        updatedDate: queryParams.updatedDate ? new Date(queryParams.updatedDate) : undefined,
      };
  
      // Lấy thông tin user hiện tại từ token (Giả định thông qua tầng Middleware/Guard)
      const currentUser = (req as any).user?.username || 'System';
  
      return await this.nodeService.getAll(filterParams, currentUser);
    }
  
    /**
     * Lấy cấu trúc toàn bộ cây gia phả đệ quy
     * GET /api/dmn-nodes/tree
     */
    @Get('tree')
    @HttpCode(HttpStatus.OK)
    async getAllAsTree(): Promise<DmnNodeGetAsTree> {
      const tree = await this.nodeService.getAllAsTree();
      if (!tree) {
        throw new NotFoundException('Dữ liệu cây gia phả không tìm thấy hoặc chưa được khởi tạo');
      }
      return tree;
    }
  
    /**
     * Lấy thông tin chi tiết của một Node cụ thể theo ID
     * GET /api/dmn-nodes/:id
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string): Promise<DmnNodeGetVModel> {
      const nodeId = Number(id);
      if (isNaN(nodeId)) {
        throw new BadRequestException('ID của nút gia phả phải là định dạng số hợp lệ');
      }
  
      const node = await this.nodeService.getById(nodeId);
      if (!node) {
        throw new NotFoundException(`Không tìm thấy nút gia phả với ID bằng ${id}`);
      }
      return node;
    }
  
    /**
     * Lấy danh sách cha mẹ trực tiếp dựa trên ID của User
     * GET /api/dmn-nodes/parents/:userId
     */
    @Get('parents/:userId')
    @HttpCode(HttpStatus.OK)
    async getParents(@Param('userId') userId: string): Promise<DmnNodeGetVModel[]> {
      if (!userId) {
        throw new BadRequestException('Mã người dùng (userId) không được để trống');
      }
      return await this.nodeService.getParents(userId);
    }
  
    // /**
    //  * Lấy danh sách con cái trực tiếp dựa trên ID của User
    //  * GET /api/dmn-nodes/children/:userId
    //  */
    @Get('children/:userId')
    @HttpCode(HttpStatus.OK)
    async getChildren(@Param('userId') userId: string): Promise<DmnNodeGetVModel[]> {
      if (!userId) {
        throw new BadRequestException('Mã người dùng (userId) không được để trống');
      }
      return await this.nodeService.getChilds(userId);
    }
  
    // /**
    //  * Lấy danh sách cặp vợ chồng / mối quan hệ liên kết với User
    //  * GET /api/dmn-nodes/couple/:userId
    //  */
    // @Get('couple/:userId')
    // @HttpCode(HttpStatus.OK)
    // async getCouple(@Param('userId') userId: string): Promise<DmnCoupleGetVModel[]> {
    //   if (!userId) {
    //     throw new BadRequestException('Mã người dùng (userId) không được để trống');
    //   }
    //   return await this.nodeService.getCouple(userId);
    // }
  
    /**
     * Tạo mới một Node gia phả kèm theo quan hệ bạn đời (Nếu có)
     * POST /api/dmn-nodes
     */
    // @Post()
    // @HttpCode(HttpStatus.CREATED)
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async create(
    //   @Body() model: DmnNodeCreateVModel,
    //   @Req() req: Request
    // ): Promise<DmnNodeGetVModel> {
    //   // Trích xuất username an toàn từ token được gán trong request qua Passport JWT Guard
    //   const globalUserName = (req as any).user?.fullName || 'System';
      
    //   try {
    //     return await this.nodeService.create(model, globalUserName);
    //   } catch (error) {
    //     throw new BadRequestException(error.message);
    //   }
    // }
  
    /**
     * Cập nhật thông tin của một Node gia phả hiện tại
     * PUT /api/dmn-nodes
     */
    // @Put()
    // @HttpCode(HttpStatus.OK)
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async update(
    //   @Body() model: DmnNodeUpdateVModel,
    //   @Req() req: Request
    // ): Promise<{ message: string }> {
    //   const globalUserName = (req as any).user?.fullName || 'System';
  
    //   try {
    //     const result = await this.nodeService.update(model, globalUserName);
    //     if (result === 404) {
    //       throw new NotFoundException(`Không tìm thấy nút gia phả cần cập nhật với ID bằng ${model.id}`);
    //     }
    //     return { message: 'Cập nhật thông tin nút gia phả thành công' };
    //   } catch (error) {
    //     if (error instanceof NotFoundException) {
    //       throw error;
    //     }
    //     throw new BadRequestException(error.message);
    //   }
    // }
  
    /**
     * Xóa một Node gia phả (Chỉ cho phép xóa khi không còn nút con)
     * DELETE /api/dmn-nodes/:id
     */
    // @Delete(':id')
    // @HttpCode(HttpStatus.OK)
    // async remove(@Param('id') id: string): Promise<{ message: string }> {
    //   const nodeId = Number(id);
    //   if (isNaN(nodeId)) {
    //     throw new BadRequestException('ID cần xóa phải là kiểu số hợp lệ');
    //   }
  
    //   try {
    //     const result = await this.nodeService.remove(nodeId);
    //     if (result === 404) {
    //       throw new NotFoundException(`Không tìm thấy nút gia phả cần xóa với ID bằng ${id}`);
    //     }
    //     return { message: 'Xóa nút gia phả thành công' };
    //   } catch (error) {
    //     if (error instanceof NotFoundException) {
    //       throw error;
    //     }
    //     throw new BadRequestException(error.message);
    //   }
    // }
  
    /**
     * Thay đổi trạng thái hoạt động (Kích hoạt/Tạm ngắt) của một Node gia phả
     * PUT /api/dmn-nodes/:id/change-status
     */
    // @Put(':id/change-status')
    // @HttpCode(HttpStatus.OK)
    // async changeStatus(@Param('id') id: string): Promise<{ message: string }> {
    //   const nodeId = Number(id);
    //   if (isNaN(nodeId)) {
    //     throw new BadRequestException('ID cần thay đổi trạng thái phải là kiểu số hợp lệ');
    //   }
  
    //   const result = await this.nodeService.changeStatus(nodeId);
    //   if (result === 404) {
    //     throw new NotFoundException(`Không tìm thấy nút gia phả với ID bằng ${id}`);
    //   }
    //   return { message: 'Thay đổi trạng thái hoạt động của nút thành công' };
    // }
  }