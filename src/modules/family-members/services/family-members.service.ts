/**
 * Tính toán hoặc xác thực thứ tự của người con trong gia đình.
 * @param parentId ID của cha hoặc mẹ
 * @param requestedOrder (Optional) Thứ tự con do Client truyền lên
 * @param transaction Sequelize Transaction để bảo vệ tính toàn vẹn dữ liệu
 * @returns number (Thứ tự con hợp lệ)
 */


import { BaseTransactionService } from '@infrastructure/database/transaction.service';
import { PostgresUserRepository } from '@modules/users/repository/user.admin.repository';
import { ROOT_TREE_LEVEL } from '@modules/couples/constants/couple.constant';
import { CouplesRepository } from '@modules/couples/repository/couples.repository';
import { FAMILY_MEMBERS_ERROR } from '@modules/family-members/constants/family-members.constant';
import {
  NodeFilterQueryDto,
  FamilyMembersGetVModel,
  NodePaginationModel,
  NodeTreeVModel,
  UpdateNodeRequestDto,
  ICreatedFamilyMembersRequest,
  IFamilyMembersPaginationDTO,
  CreatedFamilyMembersRequestDto,
  UpdatedFamilyMembersRequestDto,
  FamilyMembersPaginationDTO,
} from '@modules/family-members/dto/family-members.request.dto';
import {
  mapEntityToTree,
  mapEntityToVModel,
} from '@modules/family-members/helpers/node.mapper';
import { FamilyMembersRepository } from '@modules/family-members/repository/postgres-family-members.repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Op, Sequelize, Transaction } from 'sequelize';
import { FamilyMembersModel, IFamilyMembers } from '@infrastructure/models/family-members.model';
import { UserModel } from '@infrastructure/models/user.model';
import { BaseService } from '@core/services/base.service';
import { GetAllFamilyMembersResponseDto, GetByIdFamilyMembersResponseDto } from '@modules/family-members/dto/family-members.response.dto';
import { InjectConnection } from '@nestjs/sequelize';
import { RedisService } from '@redis/redis.service';

export interface TreeAttachmentResult {
  nodeId: string;
  coupleId: string;
  couple_order: number;
  parent_couple_id?: string;
  parentUserId?: string;
}

@Injectable()
export class FamilyMemberService extends BaseService<
FamilyMembersModel,
CreatedFamilyMembersRequestDto,
UpdatedFamilyMembersRequestDto,
GetByIdFamilyMembersResponseDto,
GetAllFamilyMembersResponseDto
>{
  protected entityName: string;
  private familyMembers: string[] = [];
  protected readonly getAllDtoClass = GetAllFamilyMembersResponseDto;
  protected readonly getByIdDtoClass = GetByIdFamilyMembersResponseDto;
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    protected repository: FamilyMembersRepository,
    private readonly coupleRepository: CouplesRepository,
    private readonly userRepository: PostgresUserRepository,
    private readonly baseTransactionService: BaseTransactionService,
    public cacheManage: RedisService,
  ) {
    super(repository);
    this.entityName = 'family_members';
  }
  protected async moduleInit() {
    this.familyMembers = ['Iphone', 'Galaxy'];
  }

  protected async bootstrapLogic(): Promise<void> {
    Logger.log(`🛑 repository--------->`, this.repository);
    Logger.log(this.repository);
  }

  protected async beforeAppShutDown(signal): Promise<void> {
    this.stopJob();
    Logger.log(`🛑 beforeApplicationShutdown: UserService cleanup before shutdown.`);
  }

  private async stopJob() {
    Logger.log('logic dừng cron job: ');
    Logger.log('* Ngắt kết nối queue worker: ');
  }

  protected async moduleDestroy() {
    this.familyMembers = [];
    Logger.log('🗑️onModuleDestroy -> familymembers: ', this.familyMembers);
  }
  private async generateNextChildOrder(
    parentId: string,
    transaction?: Transaction,
  ): Promise<number> {
    // 1. Lấy số thứ tự lớn nhất hiện tại
    const currentMaxOrder = await this.repository.getMaxChildOrder(
      parentId,
      transaction,
    );
    
    // 2. Tự động tăng thêm 1
    const nextOrder = currentMaxOrder + 1;
  
    // 3. Khóa an toàn (Chống Concurrency)
    const isConflict = await this.repository.existsChildOrder(
      parentId,
      nextOrder,
      transaction,
    );
  
    if (isConflict) {
      throw new ConflictException(
        `Hệ thống đang bận xử lý một thao tác khác trên nhánh gia đình này. Vui lòng thử lại!`
      );
    }
  
    return nextOrder;
  }

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

    const parentNode = await this.repository.findByUserId(parentUserId, transaction);
    if (!parentNode) {
      throw new NotFoundException(FAMILY_MEMBERS_ERROR.PARENT_NODE_NOT_FOUND);
    }

    // return this.attachToParentNode(newUserId, parentNode.id, 1, transaction, parentUserId);
  }

  async create(dto: ICreatedFamilyMembersRequest): Promise<FamilyMembersGetVModel | any> {
    return this.baseTransactionService.runInTransaction(async (transaction) => {
      const user = await this.userRepository.findByPk(dto.user_id, [], false, { transaction }); 
      if (!user) throw new NotFoundException(FAMILY_MEMBERS_ERROR.USER_NOT_FOUND);

      const existingNode = await this.repository.findByUserId(dto.user_id, transaction); 
      if (existingNode) {
        throw new ConflictException(FAMILY_MEMBERS_ERROR.USER_ALREADY_HAS_NODE);
      }

      let node: FamilyMembersModel;

      if (!dto.parent_couple_id) {
        node = await this.createRootNode(dto, transaction);
      } else {
        node = await this.createChildNode(dto, transaction);
      }

      const created = await this.repository.findByPkWithRelations(node.id, transaction);
      return mapEntityToVModel(created!);
    });
  }

  // async update(nodeId: string, dto: UpdateNodeRequestDto, actor: string): Promise<FamilyMembersGetVModel> {
  //   return this.baseTransactionService.runInTransaction(async (transaction) => {
  //     const entity = await this.repository.findByPk(nodeId, [], false, { transaction });
  //     if (!entity) {
  //       throw new NotFoundException(FAMILY_MEMBERS_ERROR.NODE_NOT_FOUND);
  //     }

  //     if (dto.userId && dto.userId !== entity.user_id) {
  //       const user = await this.userRepository.findByPk(dto.userId, [], false, { transaction });
  //       if (!user) {
  //         throw new NotFoundException(FAMILY_MEMBERS_ERROR.USER_NOT_FOUND);
  //       }
  //       const existingNode = await this.repository.findByUserId(dto.userId, transaction);
  //       if (existingNode && existingNode.id !== nodeId) {
  //         throw new ConflictException(FAMILY_MEMBERS_ERROR.USER_ALREADY_HAS_NODE);
  //       }
  //     }

  //     if (dto.child_order !== undefined && dto.child_order !== entity.child_order) {
  //       if (!entity.parent_couple_id && !dto.parent_couple_id) {
  //         throw new BadRequestException(FAMILY_MEMBERS_ERROR.CANNOT_PROVIDE_MEMBERS_WITHOUT_PARENT);
  //       }
  //       const parent_couple_id = dto.parent_couple_id ?? entity.parent_couple_id;
  //       if (parent_couple_id) {
  //         // await this.validateMemberOrder(parent_couple_id, dto.child_order!, nodeId, transaction);
  //       }
  //     }

  //     // await this.repository.updateNode(
  //     //   nodeId,
  //     //   {
  //     //     user_id: dto.userId ?? entity.user_id,
  //     //     parent_couple_id: dto.parent_couple_id ?? entity.parent_couple_id,
  //     //     child_order: dto.child_order ?? entity.child_order,
  //     //     updated_by: actor,
  //     //   },
  //     //   transaction,
  //     // );

  //     const updated = await this.repository.findByPkWithRelations(nodeId, transaction);
  //     return mapEntityToVModel(updated!);
  //   });
  // }

  async remove(nodeId: string, actor: string): Promise<void> {
    await this.baseTransactionService.runInTransaction(async (transaction) => {
      const entity = await this.repository.findByPk(nodeId, [], false, { transaction });
      if (!entity) {
        throw new NotFoundException(FAMILY_MEMBERS_ERROR.NODE_NOT_FOUND);
      }

      if (!entity.parent_couple_id) {
        throw new BadRequestException(FAMILY_MEMBERS_ERROR.CANNOT_DELETE_ROOT_NODE);
      }

      const child = await this.repository.findByParentId(nodeId, transaction);
      if (child) {
        throw new BadRequestException(FAMILY_MEMBERS_ERROR.CANNOT_DELETE_NODE_WITH_CHILDREN);
      }

      await this.repository.softDeactivate(nodeId, actor, transaction);
      await this.coupleRepository.deactivateByNodeId(nodeId, transaction);
      await this.repository.decrementMembers(entity.parent_couple_id!, transaction);
    });
  }

  async changeStatus(nodeId: string, actor: string): Promise<FamilyMembersGetVModel> {
    const entity = await this.repository.findByPk(nodeId);
    if (!entity) {
      throw new NotFoundException(FAMILY_MEMBERS_ERROR.NODE_NOT_FOUND);
    }

    // await this.repository.updateNode(nodeId, {
    //   updated_by: actor,
    // });

    const updated = await this.repository.findByPkWithRelations(nodeId);
    return mapEntityToVModel(updated!);
  }

  async detachMemberByUserId(userId: string, transaction?: Transaction): Promise<void> {
    const run = async (tx: Transaction) => {
      const node = await this.repository.findByUserId(userId, tx);
      if (!node) {
        return;
      }

      if (!node.parent_couple_id) {
        await this.repository.softDeactivate(node.id, 'system', tx);
        await this.coupleRepository.deactivateByNodeId(node.id, tx);
        return;
      }

      const child = await this.repository.findByParentId(node.id, tx);
      if (child) {
        throw new BadRequestException(FAMILY_MEMBERS_ERROR.CANNOT_DELETE_NODE_WITH_CHILDREN);
      }

      await this.repository.softDeactivate(node.id, 'system', tx);
      await this.coupleRepository.deactivateByUserId(userId, tx);
      await this.repository.decrementMembers(node.parent_couple_id, tx);
    };

    if (transaction) {
      await run(transaction);
      return;
    }

    await this.baseTransactionService.runInTransaction(run);
  }

  async searchFamilyMembers(query: IFamilyMembersPaginationDTO): Promise<GetAllFamilyMembersResponseDto | any> {
    const { user_id, ...baseParams } = query;
    return super.search(baseParams, query, options => {
        const include = Array.isArray(options.include)
            ? options.include
            : options.include
                ? [options.include]
                : [];

        const userInclude:any = {
            model: UserModel,
            as: 'user',
            attributes: ['fullname', 'age'],
        };
        const coupleInclude:any = {
            model: UserModel,
            as: 'wife',
            attributes: ['id', 'fullname'],
            through: {
              as: 'info',
              attributes: ['marriage_status', 'marriage_date'],
              // attributes: [],
            },
        };

        if (user_id) {
            userInclude.where = {
                id: user_id,
            };

            userInclude.required = true;
        }
        //  Bổ sung Nested Join để lấy fullname thông qua parent_couple_id
        const fatherInclude = {
          model: FamilyMembersModel,
          as: 'father',
          attributes: ['id', 'user_id',  'parent_couple_id'],
          include: [
            {
              model: UserModel,
              as:'user',
              attributes: ['fullname'],
            }
          ]
        }

        options.include = [
            ...include,
            userInclude,
            fatherInclude,
            coupleInclude
        ];

        return options;
    });
  }

  async getAllAsTree(): Promise<NodeTreeVModel> {
    const allfamily_members = await this.repository.findAll({ status: true });
    const userIds = allfamily_members?.map((n) => n.user_id) ?? [];
    const users = await this.userRepository.findAll(userIds);
    const userMap = new Map(users?.map((u) => [u.id, u]) ?? []);

    const rootNodeEntity = allfamily_members?.find((x) => x.parent_couple_id === null || x.parent_couple_id === undefined);
    if (!rootNodeEntity) {
      throw new NotFoundException('Family tree root not found');
    }

    return mapEntityToTree(rootNodeEntity, allfamily_members ?? [], userMap as Map<string, UserModel>);
  }

  async getById(id: string): Promise<FamilyMembersGetVModel | null> {
    const entity = await this.repository.findByPkWithRelations(id);
    if (!entity) {
      return null;
    }
    return mapEntityToVModel(entity);
  }

  async getChilds(userId: string): Promise<FamilyMembersGetVModel[]> {
    const parentNode = await this.repository.findByUserId(userId);
    if (!parentNode) {
      return [];
    }

    const childNode = await this.repository.findChildrenByParentId(parentNode.id);
    if (!childNode || childNode.length === 0) {
      return [];
    }

    const childrenDetails = await Promise.all(
      childNode.map((child) =>
        this.repository.findByPkWithRelations(child.id)
      )
    );
    return childrenDetails
    .filter((child): child is NonNullable<typeof child> => child !== null)
    .map((child) => mapEntityToVModel(child));
  }

  async hasChildren(nodeId: string, transaction?: Transaction): Promise<boolean> {
    const child = await this.repository.findByParentId(nodeId, transaction);
    return !!child;
  }

  async getParents(userId: string): Promise<FamilyMembersGetVModel[]> {
    const currentNode = await this.repository.findByUserId(userId);
    if (!currentNode?.parent_couple_id) {
      return [];
    }

    const parent = await this.getById(currentNode.parent_couple_id);
    return parent ? [parent] : [];
  }

  private async attachToParentNode(
    childPayload: {user_id: string, parent_couple_id: string | null, child_order: number} ,
    parent: IFamilyMembers, // Node cha/mẹ đã được query từ database trước đó
    transaction: Transaction
  ): Promise<FamilyMembersModel> {
    // Thế hệ của con LUÔN LUÔN bằng thế hệ của cha/mẹ cộng thêm 1
    const childGenerationOrder = parent.generation_order + 1;

    // 3. Khởi tạo Node con mới
    const newChildNode = await this.repository.create(
      {
        user_id: childPayload.user_id,
        parent_couple_id: parent.id || null, 
        child_order: childPayload.child_order,
        generation_order: childGenerationOrder, 
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
    console.log('==================đang tạo cụ tổ==================')
    const existingRoot = await this.repository.findRootNode(dto.parent_couple_id, transaction);
    if (existingRoot) {
      throw new ConflictException(FAMILY_MEMBERS_ERROR.ROOT_NODE_ALREADY_EXISTS);
    }

    const node = await this.repository.create(
      {
        user_id: dto.user_id,
        parent_couple_id: null,
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
    const { parent_couple_id, user_id } = dto;
    // Step 1: Kiểm tra Node Cha/Mẹ có tồn tại hay không
    if(!parent_couple_id) throw new BadRequestException(FAMILY_MEMBERS_ERROR.CANNOT_PROVIDE_MEMBERS_WITHOUT_PARENT);
    const parent = await this.repository.findOneByField( 'user_id', parent_couple_id);
    // const parentNode = await this.repository.findByPk( parent.id, [], true, { transaction });
    // console.log('---parentNode---', parentNode)
    if (!parent)  throw new NotFoundException(FAMILY_MEMBERS_ERROR.PARENT_NODE_NOT_FOUND);

    // 2. Tự động sinh ra số thứ tự con tiếp theo bằng Method đã đóng gói
    const nextChildOrder = await this.generateNextChildOrder(parent.id, transaction);

    // 3. Đóng gói Payload và gắn số thứ tự vừa sinh ra
    const childPayload = {
      ...dto,
      child_order: nextChildOrder,
    };
  // 4. Tạo Node con mới
  const attachment = await this.attachToParentNode(
    childPayload,
    parent,
    transaction,
  );

  return (await this.repository.findByPk(
    attachment.id,
    [],
    false,
    { transaction },
  )) as FamilyMembersModel;
  }

  async updateNode( id: string, data: Partial<FamilyMembersModel>, transaction?: Transaction ): Promise<FamilyMembersModel | null> {
    const node = await this.repository.findByPk(id, [], false);
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
    
    const existingSpouseNode = await this.repository.findByUserId(couple_id, transaction);
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
