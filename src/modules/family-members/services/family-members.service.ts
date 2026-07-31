import { BaseTransactionService } from '@infrastructure/database/transaction.service';
import { PostgresUserRepository } from '@modules/users/repository/user.admin.repository';
import { ROOT_TREE_LEVEL } from '@modules/couples/constants/couple.constant';
import { PostgresCoupleRepository } from '@modules/couples/repository/postgres-couple.repository';
import { FAMILY_MEMBERS_ERROR } from '@/modules/family-members/constants/family_members.constant';
import {
  NodeFilterQueryDto,
  FamilyMembersGetVModel,
  NodePaginationModel,
  NodeTreeVModel,
  UpdateNodeRequestDto,
  ICreatedFamilyMembersRequest,
} from '@modules/family-members/dto/family-members.request.dto';
import {
  mapEntityToTree,
  mapEntityToVModel,
} from '@modules/family-members/helpers/node.mapper';
import { PostgresFamilyMembersRepository } from '@modules/family-members/repository/postgres-family-members.repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transaction } from 'sequelize';
import { FamilyMembersModel, IFamilyMembers } from '@infrastructure/models/family-members.model';
import { UserModel } from '@infrastructure/models/user.model';

export interface TreeAttachmentResult {
  nodeId: string;
  coupleId: string;
  couple_order: number;
  father_id?: string;
  parentUserId?: string;
}

@Injectable()
export class FamilyMemberService {
  constructor(
    private readonly familyMemberRepository: PostgresFamilyMembersRepository,
    private readonly coupleRepository: PostgresCoupleRepository,
    private readonly userRepository: PostgresUserRepository,
    private readonly baseTransactionService: BaseTransactionService,
  ) {}

  async attachMemberToTree(
    newUserId: string,
    parentUserId: string | undefined,
    transaction: Transaction,
  ): Promise<TreeAttachmentResult | null | any> {
    if (!parentUserId) {
      return null;
    }

    if (parentUserId === newUserId) {
      throw new BadRequestException(FAMILY_MEMBERS_ERROR.CANNOT_ATTACH_TO_SELF);
    }

    const parent = await this.userRepository.findByPk(parentUserId, [], false, { transaction });
    if (!parent) {
      throw new NotFoundException(FAMILY_MEMBERS_ERROR.PARENT_USER_NOT_FOUND);
    }

    const parentNode = await this.familyMemberRepository.findByUserId(parentUserId, transaction);
    if (!parentNode) {
      throw new NotFoundException(FAMILY_MEMBERS_ERROR.PARENT_NODE_NOT_FOUND);
    }

    // return this.attachToParentNode(newUserId, parentNode.id, 1, transaction, parentUserId);
  }

  async create(dto: ICreatedFamilyMembersRequest): Promise<FamilyMembersGetVModel | any> {
    return this.baseTransactionService.runInTransaction(async (transaction) => {
      const user = await this.userRepository.findByPk(dto.user_id!, [], false, { transaction }); // TODO: Fix this
      if (!user) throw new NotFoundException(FAMILY_MEMBERS_ERROR.USER_NOT_FOUND);

      const existingNode = await this.familyMemberRepository.findByUserId(dto.user_id!, transaction); // TODO: Fix this
      if (existingNode) {
        throw new ConflictException(FAMILY_MEMBERS_ERROR.USER_ALREADY_HAS_NODE);
      }

      let node: FamilyMembersModel;

      if (!dto.father_id) {
        node = await this.createRootNode(dto, transaction);
      } else {
        node = await this.createChildNode(dto, transaction);
      }

      // if (dto.couple_id) {
      //   await this.createSpouseCouple(dto.couple_id, node.id, node, transaction);
      // }
      const created = await this.familyMemberRepository.findByPkWithRelations(node.id, transaction);
      return mapEntityToVModel(created!);
    });
  }

  async update(nodeId: string, dto: UpdateNodeRequestDto, actor: string): Promise<FamilyMembersGetVModel> {
    return this.baseTransactionService.runInTransaction(async (transaction) => {
      const entity = await this.familyMemberRepository.findByPk(nodeId, [], false, { transaction });
      if (!entity) {
        throw new NotFoundException(FAMILY_MEMBERS_ERROR.NODE_NOT_FOUND);
      }

      if (dto.userId && dto.userId !== entity.user_id) {
        const user = await this.userRepository.findByPk(dto.userId, [], false, { transaction });
        if (!user) {
          throw new NotFoundException(FAMILY_MEMBERS_ERROR.USER_NOT_FOUND);
        }
        const existingNode = await this.familyMemberRepository.findByUserId(dto.userId, transaction);
        if (existingNode && existingNode.id !== nodeId) {
          throw new ConflictException(FAMILY_MEMBERS_ERROR.USER_ALREADY_HAS_NODE);
        }
      }

      if (dto.child_order !== undefined && dto.child_order !== entity.child_order) {
        if (!entity.father_id && !dto.father_id) {
          throw new BadRequestException(FAMILY_MEMBERS_ERROR.CANNOT_PROVIDE_MEMBERS_WITHOUT_PARENT);
        }
        const father_id = dto.father_id ?? entity.father_id;
        if (father_id) {
          // await this.validateMemberOrder(father_id, dto.child_order!, nodeId, transaction);
        }
      }

      // await this.familyMemberRepository.updateNode(
      //   nodeId,
      //   {
      //     user_id: dto.userId ?? entity.user_id,
      //     father_id: dto.father_id ?? entity.father_id,
      //     child_order: dto.child_order ?? entity.child_order,
      //     updated_by: actor,
      //   },
      //   transaction,
      // );

      const updated = await this.familyMemberRepository.findByPkWithRelations(nodeId, transaction);
      return mapEntityToVModel(updated!);
    });
  }

  async remove(nodeId: string, actor: string): Promise<void> {
    await this.baseTransactionService.runInTransaction(async (transaction) => {
      const entity = await this.familyMemberRepository.findByPk(nodeId, [], false, { transaction });
      if (!entity) {
        throw new NotFoundException(FAMILY_MEMBERS_ERROR.NODE_NOT_FOUND);
      }

      if (!entity.father_id) {
        throw new BadRequestException(FAMILY_MEMBERS_ERROR.CANNOT_DELETE_ROOT_NODE);
      }

      const child = await this.familyMemberRepository.findByParentId(nodeId, transaction);
      if (child) {
        throw new BadRequestException(FAMILY_MEMBERS_ERROR.CANNOT_DELETE_NODE_WITH_CHILDREN);
      }

      await this.familyMemberRepository.softDeactivate(nodeId, actor, transaction);
      await this.coupleRepository.deactivateByNodeId(nodeId, transaction);
      await this.familyMemberRepository.decrementMembers(entity.father_id!, transaction);
    });
  }

  async changeStatus(nodeId: string, actor: string): Promise<FamilyMembersGetVModel> {
    const entity = await this.familyMemberRepository.findByPk(nodeId);
    if (!entity) {
      throw new NotFoundException(FAMILY_MEMBERS_ERROR.NODE_NOT_FOUND);
    }

    // await this.familyMemberRepository.updateNode(nodeId, {
    //   updated_by: actor,
    // });

    const updated = await this.familyMemberRepository.findByPkWithRelations(nodeId);
    return mapEntityToVModel(updated!);
  }

  async detachMemberByUserId(userId: string, transaction?: Transaction): Promise<void> {
    const run = async (tx: Transaction) => {
      const node = await this.familyMemberRepository.findByUserId(userId, tx);
      if (!node) {
        return;
      }

      if (!node.father_id) {
        await this.familyMemberRepository.softDeactivate(node.id, 'system', tx);
        await this.coupleRepository.deactivateByNodeId(node.id, tx);
        return;
      }

      const child = await this.familyMemberRepository.findByParentId(node.id, tx);
      if (child) {
        throw new BadRequestException(FAMILY_MEMBERS_ERROR.CANNOT_DELETE_NODE_WITH_CHILDREN);
      }

      await this.familyMemberRepository.softDeactivate(node.id, 'system', tx);
      await this.coupleRepository.deactivateByUserId(userId, tx);
      await this.familyMemberRepository.decrementMembers(node.father_id, tx);
    };

    if (transaction) {
      await run(transaction);
      return;
    }

    await this.baseTransactionService.runInTransaction(run);
  }

  async getAll(query: NodeFilterQueryDto): Promise<NodePaginationModel> {
    const page = query.pageNumber ?? 1;
    const limit = query.pageSize ?? 10;

    const { items, total } = await this.familyMemberRepository.search({
      page,
      limit,
      keyword: query.keyword ?? '',
      sortBy: 'created_at',
    });

    const records: FamilyMembersGetVModel[] = [];
    for (const node of items) {
      const detail = await this.getById(node.id);
      if (detail) {
        records.push(detail);
      }
    }

    return { records, totalRecords: total };
  }

  async getAllAsTree(): Promise<NodeTreeVModel> {
    const allfamily_members = await this.familyMemberRepository.findAll({ status: true });
    const userIds = allfamily_members?.map((n) => n.user_id) ?? [];
    const users = await this.userRepository.findAll(userIds);
    const userMap = new Map(users?.map((u) => [u.id, u]) ?? []);

    const rootNodeEntity = allfamily_members?.find((x) => x.father_id === null || x.father_id === undefined);
    if (!rootNodeEntity) {
      throw new NotFoundException('Family tree root not found');
    }

    return mapEntityToTree(rootNodeEntity, allfamily_members ?? [], userMap as Map<string, UserModel>);
  }

  async getById(id: string): Promise<FamilyMembersGetVModel | null> {
    const entity = await this.familyMemberRepository.findByPkWithRelations(id);
    if (!entity) {
      return null;
    }
    return mapEntityToVModel(entity);
  }

  async getChilds(userId: string): Promise<FamilyMembersGetVModel[]> {
    const parentNode = await this.familyMemberRepository.findByUserId(userId);
    if (!parentNode) {
      return [];
    }

    const childNode = await this.familyMemberRepository.findChildrenByParentId(parentNode.id);
    if (!childNode || childNode.length === 0) {
      return [];
    }

    const childrenDetails = await Promise.all(
      childNode.map((child) =>
        this.familyMemberRepository.findByPkWithRelations(child.id)
      )
    );
    return childrenDetails
    .filter((child): child is NonNullable<typeof child> => child !== null)
    .map((child) => mapEntityToVModel(child));
  }

  async hasChildren(nodeId: string, transaction?: Transaction): Promise<boolean> {
    const child = await this.familyMemberRepository.findByParentId(nodeId, transaction);
    return !!child;
  }
  async getParents(userId: string): Promise<FamilyMembersGetVModel[]> {
    const currentNode = await this.familyMemberRepository.findByUserId(userId);
    if (!currentNode?.father_id) {
      return [];
    }

    const parent = await this.getById(currentNode.father_id);
    return parent ? [parent] : [];
  }

  private async attachToParentNode(
    dto: ICreatedFamilyMembersRequest,
    parent: IFamilyMembers, // Node cha/mẹ đã được query từ database trước đó
    transaction: Transaction
  ): Promise<FamilyMembersModel> {
    
    // [ĐÃ XÓA] - Bỏ hoàn toàn đoạn code kiểm tra existingChild gây lỗi "PARENT_ALREADY_HAS_CHILD"
    
    // 1. Validate thứ tự anh em (Tránh 2 người con cùng chung số thứ tự)
      await this.familyMemberRepository.validateMemberOrder(dto.father_id!, dto.mother_id!, dto.child_order, transaction);
  
    // 2. Tính toán thế hệ (Generation Order) - Lõi nghiệp vụ
    // Thế hệ của con LUÔN LUÔN bằng thế hệ của cha/mẹ cộng thêm 1
    const childGenerationOrder = parent.generation_order + 1;
    
    // 3. Khởi tạo Node con mới
    const newChildNode = await this.familyMemberRepository.create(
      {
        user_id: dto.user_id,
        father_id: dto.father_id || null, 
        mother_id: dto.mother_id || null, // Bổ sung để hỗ trợ cả nhánh của mẹ đơn thân
        child_order: dto.child_order,
        generation_order: childGenerationOrder, 
        parent_branch_id: parent.parent_branch_id, 
      },
      { transaction }
    );
  
    // 4. (Tùy chọn) Tăng biến đếm số lượng thành viên của node cha nếu bạn có lưu cache/counter
    // await this.incrementMembers(parent.id, transaction);
  
    return newChildNode;
  }

  private async createRootNode(
    dto: ICreatedFamilyMembersRequest,
    transaction: Transaction,
  ): Promise<FamilyMembersModel | any>{
    console.log('đang tạo cụ tổ')
    const existingRoot = await this.familyMemberRepository.findRootNode(dto.father_id, dto.mother_id, transaction);
    if (existingRoot) {
      throw new ConflictException(FAMILY_MEMBERS_ERROR.ROOT_NODE_ALREADY_EXISTS);
    }
    
    if (dto.child_order !== undefined && dto.child_order !== null) {
      throw new BadRequestException(FAMILY_MEMBERS_ERROR.CANNOT_PROVIDE_MEMBERS_WITHOUT_PARENT);
    }

    const node = await this.familyMemberRepository.create(
      {
        user_id: dto.user_id,
        father_id: null,
        generation_order: 1
      },
      { transaction },
    );

    return node as FamilyMembersModel;
  }

  
  private async createChildNode(
    dto: ICreatedFamilyMembersRequest,
    transaction: Transaction,
  ): Promise<FamilyMembersModel | any> {
    console.log('---đang tạo đứa con---')
    const parent = await this.familyMemberRepository.findByPk(dto.father_id!, [], false, { transaction }); // TODO: Fix this
    if (!parent) {
      throw new NotFoundException(FAMILY_MEMBERS_ERROR.PARENT_NODE_NOT_FOUND);
    }

    let childOrder = dto.child_order;
    if (!childOrder) {
      const maxOrder = await this.familyMemberRepository.max('child_order', {
        where: { father_id: dto.father_id },
        transaction,
      });
      childOrder = maxOrder + 1;
    }

    const dtoWithOrder = { ...dto, child_order: childOrder };

    if (dtoWithOrder.father_id || dtoWithOrder.mother_id) {
      await this.familyMemberRepository.validateMemberOrder(
        dtoWithOrder.father_id!,
        dtoWithOrder.mother_id!,
        dtoWithOrder.child_order,
        transaction,
      );
    }
    const attachment = await this.attachToParentNode(dto,parent,transaction);
    return (await this.familyMemberRepository.findByPk(attachment.id, [], false, { transaction })) as FamilyMembersModel;
  }

  async updateNode( id: string, data: Partial<FamilyMembersModel>, transaction?: Transaction ): Promise<FamilyMembersModel | null> {
    const node = await this.familyMemberRepository.findByPk(id, [], false);
    if (!node) {
      return null;
    }
    await node.update(data, { transaction });
    return node;
  }

  private async createSpouseCouple(
    couple_id: string,
    nodeId: string,
    node: FamilyMembersModel,
    transaction: Transaction,
  ): Promise<void> {
    if (couple_id === node.user_id) {
      throw new BadRequestException(FAMILY_MEMBERS_ERROR.CANNOT_ATTACH_TO_SELF);
    }

    const spouse = await this.userRepository.findByPk(couple_id, [], false, { transaction });
    if (!spouse) {
      throw new NotFoundException(FAMILY_MEMBERS_ERROR.USER_NOT_FOUND);
    }
    
    const existingSpouseNode = await this.familyMemberRepository.findByUserId(couple_id, transaction);
    if (existingSpouseNode) {
      throw new ConflictException(FAMILY_MEMBERS_ERROR.COUPLE_USER_ALREADY_HAS_NODE);
    }
    
    const ownerCouple = await this.coupleRepository.findByUserId(node.user_id, transaction);
    const couple_order = ownerCouple?.couple_order ?? ROOT_TREE_LEVEL;
    // await this.coupleRepository.create(
    //   {
    //     user_id: couple_id,
    //     node_id: nodeId,
    //     couple_order,
    //   },
    //   { transaction },
    // );
  }

  
}
