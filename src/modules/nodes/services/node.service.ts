import { PostgresUserRepository } from '@modules/users/repository/user.admin.repository';
import { ROOT_TREE_LEVEL } from '@modules/couples/constants/couple.constant';
import { PostgresCoupleRepository } from '@modules/couples/repository/postgres-couple.repository';
import { NODE_ERROR } from '@modules/nodes/constants/node.constant';
import { PostgresNodeRepository } from '@modules/nodes/repository/postgres-node.repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Op, Sequelize, Transaction } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { NodeModel } from '@/infrastructure/models/node.model';
import { UserEntity } from '@/infrastructure/models/user.model';
import { CoupleModel } from '@/infrastructure/models/couple.model';
  
export interface TreeAttachmentResult {
  nodeId: string;
  coupleId: string;
  level: number;
  parentNodeId?: string;
  parentUserId?: string;
}

@Injectable()
export class NodeService {
  constructor(
    @InjectModel(NodeModel)
    private readonly nodeModel: NodeModel,
    @InjectModel(UserEntity)
    private readonly userModel: UserEntity,
    @InjectModel(CoupleModel)
    private readonly coupleModel: CoupleModel,
    private readonly nodeRepository: PostgresNodeRepository,
    private readonly coupleRepository: PostgresCoupleRepository,
    private readonly userRepository: PostgresUserRepository,
  ) {}

  async attachMemberToTree(
    newUserId: string,
    parentUserId: string | undefined,
    transaction: Transaction,
  ): Promise<TreeAttachmentResult | null> {
    if (!parentUserId) {
      return null;
    }

    if (parentUserId === newUserId) {
      throw new BadRequestException(NODE_ERROR.CANNOT_ATTACH_TO_SELF);
    }

    const parent = await this.userRepository.findByPk(parentUserId, [], false, { transaction });
    if (!parent) {
      throw new NotFoundException(NODE_ERROR.PARENT_USER_NOT_FOUND);
    }

    const existingNode = await this.nodeRepository.findByUserId(newUserId, transaction);
    if (existingNode) {
      throw new ConflictException(NODE_ERROR.USER_ALREADY_HAS_NODE);
    }

    const parentNode = await this.nodeRepository.findByUserId(parentUserId, transaction);
    if (!parentNode) {
      throw new NotFoundException(NODE_ERROR.PARENT_NODE_NOT_FOUND);
    }

    const existingChild = await this.nodeRepository.findByParentId(parentNode.id, transaction);
    if (existingChild) {
      throw new ConflictException(NODE_ERROR.PARENT_ALREADY_HAS_CHILD);
    }

    const parentCouple = await this.coupleRepository.findByUserId(parentUserId, transaction);
    const level = (parentCouple?.level ?? ROOT_TREE_LEVEL) + 1;

    const childNode = await this.nodeRepository.create(
      {
        user_id: newUserId,
        parent_id: parentNode.id,
        members: 1,
        is_active: true,
      },
      { transaction },
    );

    const couple = await this.coupleRepository.create(
      {
        user_id: newUserId,
        node_id: childNode.id,
        level,
        is_active: true,
      },
      { transaction },
    );

    await this.nodeRepository.incrementMembers(parentNode.id, transaction);

    return {
      nodeId: childNode.id,
      coupleId: couple.id,
      level,
      parentNodeId: parentNode.id,
      parentUserId,
    };
  }
  async getAll(parameters: DmnNodeFilterParams, currentUser: string): Promise<PaginationModel<DmnNodeGetVModel>> {
    const limit = parameters.pageSize;
    const offset = (parameters.pageNumber - 1) * parameters.pageSize;

    // Xây dựng điều kiện lọc (Where clause)
    const whereClause: any = { isActive: true };
    this.buildQueryable(whereClause, parameters);

    // Xử lý tìm kiếm theo từ khóa (Keyword)
    const userIncludeWhere: any = {};
    if (parameters.keyword) {
      // Tìm theo tên User hiện tại hoặc tên của User cha mẹ
      userIncludeWhere[Op.or] = [
        { fullName: { [Op.like]: `%${parameters.keyword}%` } }
      ];
    }

    // Thực hiện truy vấn đồng thời lấy tổng số bản ghi và dữ liệu phân trang
    const { items: records, total: totalRecords } = await this.nodeRepository.search({
      page: parameters.pageNumber,
      limit: parameters.pageSize,
      keyword: parameters.keyword || '',
      orderBy: 'created_at',
      sortOrder: 'DESC',
    });

    // Ánh xạ dữ liệu trả về và bổ sung thông tin Cha mẹ
    const result: DmnNodeGetVModel[] = [];
    for (const node of records) {
      const userModel = node.user ? this.mapUserToVModel(node.user) : undefined;

      let parentModel: UserEntity | undefined = undefined;
      if (node.parentId && node.parentId !== 0) {
        const parentNode = await this.nodeRepository.findByPk(node.parentId);
        if (parentNode) {
          parentModel = parentNode.user;
        }
      }

      result.push({
        id: Number(node.id),
        userId: node.userId,
        parentId: node.parentId ? Number(node.parentId) : undefined,
        createdDate: node.createdDate,
        createdBy: node.createdBy,
        updatedDate: node.updatedDate,
        updatedBy: node.updatedBy,
        members: node.members ? Number(node.members) : undefined,
        isActive: node.isActive,
        parent: parentModel,
        user: userModel,
      });
    }

    return {
      records: result,
      totalRecords,
    };
  }

  /**
   * Lấy chi tiết một Node theo ID (GetById)
   */
  async getById(id: number): Promise<DmnNodeGetVModel | null> {
    const entity = await this.nodeRepository.findByPk(id.toString());
    if (!entity) return null;

    // Lấy thông tin cặp vợ chồng (Couples) liên quan
    const couples: any = await this.coupleRepository.findByNodeId(entity.id);
    // Lấy thông tin cha mẹ của Node hiện tại
    let userParent: UserEntity | null = null;
    if (entity.parent_id) {
      const entityParent = await this.nodeRepository.findByPk(entity.parent_id.toString());
      if (entityParent) {
        userParent = entityParent.user;
      }
    }

    // Ánh xạ các cặp quan hệ vợ chồng (Tránh lỗi N+1 Query)
    let couplesWithUsers: CoupleModel[] = [];
    if (couples && couples.length > 0) {
      couplesWithUsers = couples;
    }
    return {
      id: Number(entity.id),
      userId: entity.user_id,
      user: entity.user,
      members: entity.members ? Number(entity.members) : undefined,
      parentId: entity.parent_id ? Number(entity.parent_id) : undefined,
      createdDate: entity.created_at,
      createdBy: entity.created_by,
      updatedDate: entity.updated_at,
      updatedBy: entity.updated_by,
      isActive: entity.is_active,
    }
  }
  /**
   * Lấy danh sách con cái trực tiếp (GetChilds)
   */
  async getChilds(userId: string): Promise<any> {
    const parentNode = await this.nodeRepository.findByUserId(userId);
    if (!parentNode || Number(parentNode.id) === 0) {
      return [];
    }

    const children: DmnNodeGetVModel[] = [];
    const childNodes = await this.nodeRepository.findByParentId(parentNode.id);
    return childNodes;
  }

  /**
   * Lấy thông tin bạn đời / cặp quan hệ (GetCouple)
   */
  // async getCouple(userId: string): Promise<DmnCoupleGetVModel[]> {
  //   const parentNode = await this.nodeRepository.findByUserId(userId);
  //   if (!parentNode || Number(parentNode.id) === 0) {
  //     return [];
  //   }

  //   const couples: CoupleModel[] | null= await this.coupleRepository.findByNodeId(parentNode.id);
  //   const userIds = couples.map(c => c.user_id);

  //   const users = await this.userRepository.findAll(userIds);
  //   const userMap = new Map(users?.map(u => [u.id, u]) ?? []);

  //   return couples.map(c => {
  //     const coupleUser = userMap.get(c.user_id);
  //     return {
  //       id: Number(c.id),
  //       level: c.level,
  //       userId: c.user_id,
  //       createdDate: c.created_at,
  //       createdBy: c.created_by,
  //       isActive: c.is_active,
  //       user: coupleUser ? this.mapUserToVModel(coupleUser) : undefined,
  //     };
  //   });
  // }

  /**
   * Tạo mới một Node gia phả kèm theo cặp quan hệ (Transaction bọc toàn bộ)
   */
  // async create(model: DmnNodeCreateVModel, globalUserName: string): Promise<DmnNodeGetVModel> {
  //   if (model.parentId) {
  //     const parentNode = await this.dmnNodeModel.findOne({ where: { id: model.parentId } });
  //     if (!parentNode) {
  //       throw new NotFoundException('Không tìm thấy nút cha mẹ (Parent node not found).');
  //     }
  //     const parentUser = await this.userModel.findOne({ where: { id: parentNode.userId } });
  //     if (!parentUser) {
  //       throw new NotFoundException('Không tìm thấy tài khoản người dùng cha mẹ.');
  //     }
  //   } else if (model.members !== undefined && model.members !== null) {
  //     throw new BadRequestException('Không thể cung cấp giá trị thành viên khi chưa có ParentId.');
  //   }

  //   if (model.members !== undefined && model.members !== null && model.parentId) {
  //     const parentNode = await this.dmnNodeModel.findOne({ where: { id: model.parentId } });
  //     if (parentNode) {
  //       const childNodes = await this.getChilds(parentNode.userId);
  //       const existingMembers = childNodes
  //         .filter(c => c.members !== undefined && c.members !== null)
  //         .map(c => c.members);

  //       if (existingMembers.includes(model.members)) {
  //         throw new BadRequestException('Thứ tự vị trí thành viên này đã tồn tại trong các nút con cùng cấp.');
  //       }
  //     }
  //   }

  //   // Thực thi Transaction của Sequelize bảo vệ an toàn toàn vẹn dữ liệu
  //   return await this.sequelize.transaction(async (t) => {
  //     const entity = await this.dmnNodeModel.create({
  //       userId: model.userId,
  //       parentId: model.parentId,
  //       createdDate: new Date(),
  //       createdBy: globalUserName,
  //       isActive: model.isActive,
  //       members: model.members,
  //     } as any, { transaction: t });

  //     if (model.coupleUserId) {
  //       await this.dmnCoupleModel.create({
  //         userId: model.coupleUserId,
  //         isActive: true,
  //         level: 1,
  //         nodeId: entity.id,
  //         createdDate: new Date(),
  //         createdBy: globalUserName,
  //       } as any, { transaction: t });
  //     }

  //     return this.mapEntityToVModel(entity);
  //   });
  // }

  // /**
  //  * Cập nhật thông tin Node (Update)
  //  */
  // async update(model: DmnNodeUpdateVModel, globalUserName: string): Promise<number> {
  //   const entity = await this.dmnNodeModel.findOne({ where: { id: model.id } });
  //   if (!entity) {
  //     return 404;
  //   }

  //   if (model.members !== entity.members) {
  //     if (model.parentId) {
  //       const parentNode = await this.dmnNodeModel.findOne({ where: { id: model.parentId } });
  //       if (parentNode) {
  //         const childNodes = await this.getChilds(parentNode.userId);
  //         const existingMembers = childNodes
  //           .filter(c => c.members !== undefined && c.members !== null)
  //           .map(c => c.members);

  //         if (model.members !== undefined && model.members !== null && existingMembers.includes(model.members)) {
  //           throw new BadRequestException('Thứ tự vị trí thành viên này đã tồn tại trong các nút con.');
  //         }
  //       }
  //     }
  //   }

  //   entity.userId = model.userId;
  //   entity.parentId = model.parentId;
  //   entity.updatedDate = new Date();
  //   entity.updatedBy = globalUserName;
  //   entity.isActive = model.isActive;
  //   entity.members = model.members;

  //   await entity.save();
  //   return 1;
  // }

  /**
   * Xóa một Node (Remove)
   */
  // async remove(id: number): Promise<number> {
  //   const entity = await this.nodeRepository.findOne({ where: { id } });
  //   if (!entity) {
  //     return 404;
  //   }

  //   const hasChildren = await this.nodeRepository.findOne({ where: { parentId: id } });
  //   if (hasChildren) {
  //     throw new BadRequestException('Phải thực hiện xóa toàn bộ các nút con trước khi xóa nút gốc.');
  //   }

  //   await entity.destroy();
  //   return 1;
  // }

  // /**
  //  * Thay đổi trạng thái hoạt động (ChangeStatus)
  //  */
  // async changeStatus(id: number): Promise<number> {
  //   const entity = await this.nodeRepository.findOne({ where: { id } });
  //   if (!entity) {
  //     return 404;
  //   }

  //   entity.isActive = !entity.isActive;
  //   entity.updatedDate = new Date();

  //   await entity.save();
  //   return 1;
  // }

  // /**
  //  * Lấy cấu trúc toàn bộ cây gia phả đệ quy (GetAllAsTree)
  //  */
  async getAllAsTree(): Promise<DmnNodeGetAsTree> {
    const allNodes = await this.nodeRepository.findAll( { is_active: true } );
    const userIds = allNodes?.map(n => n.user_id) ?? [];
    const users = await this.userRepository.findAll(userIds);
    const userMap = new Map(users?.map(u => [u.id, u]) ?? []);

    const rootNodeEntity = allNodes?.find(x => x.parent_id === null || Number(x.parent_id) === 0) as NodeModel;
    if (!rootNodeEntity) {
      throw new NotFoundException('Không tìm thấy dữ liệu gốc của cây gia phả.');
    }

    return this.mapEntityToVModelTree(rootNodeEntity, allNodes ?? [], userMap as Map<string, UserEntity>);
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  private mapUserToVModel(user: UserEntity): any {
    return {
      id: user.id,
      fullname: user.fullname,
      other_name: user.other_name,
      gender: user.gender,
      year_of_birth: user.year_of_birth,
      year_of_death: user.year_of_death,
      burial_place: user.burial_place,
      address: user.address,
      biography: user.biography,
      status: user.status,
      email: user.email || '',
      is_active: user.is_active,
      created_at: user.created_at,
      updated_by: user.updated_by,
    };
  }

  async getParents(userId: string): Promise<any> {
    const currentNode = await this.nodeRepository.findByUserId(userId);
    if (!currentNode || Number(currentNode.id) === 0) {
      return [];
    }

    const parents: any[] = [];
    if (currentNode && currentNode.parent_id) {
      const parentResult = await this.getById(Number(currentNode.parent_id));
      if (parentResult) {
        parents.push(parentResult);
      }
    }
    return parents;
  }
  // private mapEntityToVModel(entity: DmnNode): DmnNodeGetVModel {
  //   return {
  //     id: Number(entity.id),
  //     userId: entity.userId,
  //     parentId: entity.parentId ? Number(entity.parentId) : undefined,
  //     createdDate: entity.createdDate,
  //     createdBy: entity.createdBy,
  //     updatedDate: entity.updatedDate,
  //     updatedBy: entity.updatedBy,
  //     isActive: entity.isActive,
  //     members: entity.members ? Number(entity.members) : undefined,
  //   };
  // }

  private mapEntityToVModelTree(
    entity: NodeModel,
    allNodes: NodeModel[],
    userMap: Map<string, UserEntity>,
  ): DmnNodeGetAsTree {
    const userEntity = userMap.get(entity.user_id);
    const userModel = userEntity ? this.mapUserToVModel(userEntity) : undefined;

    const children = allNodes
      .filter(x => Number(x.parent_id) === Number(entity.id))
      .map(child => this.mapEntityToVModelTree(child, allNodes, userMap))
      .filter(childTree => childTree.user?.isActive === true);

    return {
      id: Number(entity.id),
      userId: entity.user_id,
      parentId: entity.parent_id ? Number(entity.parent_id) : undefined,
      createdDate: entity.createdAt,
      createdBy: entity.created_by,
      updatedDate: entity.updated_at,
      updatedBy: entity.updated_by,
      isActive: entity.is_active,
      members: entity.members ? Number(entity.members) : undefined,
      children,
      user: userModel,
    };
  }

  private buildQueryable(whereClause: any, fParams: DmnNodeFilterParams): void {
    if (fParams.parentId !== undefined) {
      whereClause.parentId = fParams.parentId;
    }

    if (fParams.isActive !== undefined) {
      whereClause.isActive = fParams.isActive;
    }

    if (fParams.createdBy) {
      whereClause.createdBy = { [Op.like]: `%${fParams.createdBy}%` };
    }

    if (fParams.updatedBy) {
      whereClause.updatedBy = { [Op.like]: `%${fParams.updatedBy}%` };
    }

    // Query lọc theo ngày chính xác (Không phụ thuộc vào giờ giấc)
    if (fParams.createdDate) {
      whereClause[Op.and] = Sequelize.literal(`DATE(createdDate) = DATE('${fParams.createdDate.toISOString().split('T')[0]}')`);
    }

    if (fParams.updatedDate) {
      whereClause[Op.and] = Sequelize.literal(`DATE(updatedDate) = DATE('${fParams.updatedDate.toISOString().split('T')[0]}')`);
    }
  }
}
