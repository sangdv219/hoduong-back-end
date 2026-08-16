/**
 * Tính toán hoặc xác thực thứ tự của người con trong gia đình.
 * @param parentId ID của cha hoặc mẹ
 * @param requestedOrder (Optional) Thứ tự con do Client truyền lên
 * @param transaction Sequelize Transaction để bảo vệ tính toàn vẹn dữ liệu
 * @returns number (Thứ tự con hợp lệ)
 */


import { BaseTransactionService } from '@infrastructure/database/transaction.service';
import { UserRepository } from '@modules/users/repository/user.admin.repository';
import { CouplesRepository } from '@modules/couples/repository/couples.repository';
import { FAMILY_MEMBERS_ERROR } from '@modules/family-members/constants/family-members.constant';
import { IFamilyMembersPaginationDTO, CreatedFamilyMembersRequestDto, UpdatedFamilyMembersRequestDto, FamilyMembersAsTreeDTO } from '@modules/family-members/dto/family-members.request.dto';
import { mapEntityToVModel } from '@modules/family-members/helpers/node.mapper';
import { FamilyMembersRepository } from '@/modules/family-members/repository/family-members.repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Op, QueryTypes, Sequelize, Transaction } from 'sequelize';
import { FamilyMembersModel, IFamilyMembers } from '@infrastructure/models/family-members.model';
import { UserModel } from '@infrastructure/models/user.model';
import { BaseService } from '@core/services/base.service';
import { FamilyTreeCoupleNode, FamilyTreeNode, GetAllFamilyMembersResponseDto, GetByIdFamilyMembersResponseDto } from '@modules/family-members/dto/family-members.response.dto';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { RedisService } from '@redis/redis.service';
import { CouplesModel } from '@infrastructure/models/couples.model';

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
    @InjectModel(FamilyMembersModel)
    protected familyMembersModel: typeof FamilyMembersModel,
    protected repository: FamilyMembersRepository,
    private readonly coupleRepository: CouplesRepository,
    private readonly userRepository: UserRepository,
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
    parent_couple_id: string,
    transaction?: Transaction,
  ): Promise<number> {
    // 1. Lấy số thứ tự lớn nhất hiện tại của các con thuộc cặp vợ chồng này
    // Lưu ý: Trong Repository, bạn cần viết hàm getMaxChildOrder query theo parent_couple_id thay vì parentId
    const currentMaxOrder = await this.repository.getMaxChildOrder(
      parent_couple_id,
      transaction,
    );
    
    // 2. Tự động tăng thêm 1 (Nếu chưa có con nào thì currentMaxOrder = 0 -> nextOrder = 1)
    const nextOrder = currentMaxOrder + 1;
  
    // 3. Khóa an toàn (Chống Concurrency)
    const isConflict = await this.repository.existsChildOrder(
      parent_couple_id,
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
  }

  async createFamilyMembers(dto: CreatedFamilyMembersRequestDto) {
    this.cleanCacheRedis();
    
    return this.baseTransactionService.runInTransaction(async (transaction) => {
      // 1. Kiểm tra User có tồn tại không
      const {user_id, parent_couple_id} = dto
      const user = await this.userRepository.findByPk(user_id, [], false, { transaction }); 
      if (!user) throw new NotFoundException(FAMILY_MEMBERS_ERROR.USER_NOT_FOUND);

      // 2. Kiểm tra User đã nằm trong cây gia phả chưa
      const existingUserInFamily = await this.repository.findByUserId(user_id, transaction); 
      if (existingUserInFamily) {
        throw new ConflictException(FAMILY_MEMBERS_ERROR.USER_ALREADY_HAS_NODE);
      }

      let generation_order = 1; // Mặc định là đời thứ 1 (Cụ tổ)
      let child_order = 1;      // Mặc định là con cả (hoặc người đầu tiên)

      // 3. Phân nhánh logic: Nếu có parent_couple_id -> Là con. Nếu không có -> Là Cụ tổ
      if (parent_couple_id) {
        // --- XỬ LÝ TẠO NODE CON ---
        
        // A. Tìm kiếm thông tin cặp vợ chồng (Bố mẹ)
        const parentCoupleEntity = await this.coupleRepository.findByPk(
          parent_couple_id, 
          [], // Cần include partner_1 (hoặc 2) để lấy được generation_order của bố/mẹ
          false, 
          { 
            transaction,
            include: [{ model: FamilyMembersModel, as: 'partner_1' }]
          }
        );

        if (!parentCoupleEntity) {
          throw new NotFoundException(FAMILY_MEMBERS_ERROR.PARENT_NODE_NOT_FOUND); // Cập nhật lại error message cho phù hợp
        }

        const parentCouple = parentCoupleEntity.toJSON();

        if (!parentCouple.partner_1) {
          throw new NotFoundException("Không tìm thấy thông tin thành viên (partner_1) của cặp vợ chồng này.");
      }
        generation_order = parentCouple.partner_1.generation_order + 1;
        
        // B. Tính toán đời thứ mấy (Thế hệ con = Thế hệ bố/mẹ + 1)
        // Lưu ý: partner_1 luôn tồn tại trong 1 couple hợp lệ
        
        // C. Tính toán thứ tự anh chị em trong gia đình
        child_order = await this.generateNextChildOrder(parent_couple_id, transaction);
        
      } else {
        // --- XỬ LÝ TẠO NODE CỤ TỔ (ROOT) ---
        // (Tuỳ chọn) Nếu rule của bạn chỉ cho phép 1 cụ tổ duy nhất trong hệ thống, hãy check ở đây
        // const existingRoot = await this.repository.findOneByField('parent_couple_id', null);
        // if (existingRoot) throw new ConflictException("Đã tồn tại cụ tổ trong hệ thống");
        
        console.log('================== Đang tạo cụ tổ ==================');
      }
      const dtoNew = {
        user_id: user_id,
        parent_couple_id: parent_couple_id || null,
        generation_order: generation_order,
        child_order: child_order
      }

      return await super.create(dtoNew, transaction)
    });
  }

  // async updateFamilyMembers(id: string, dto: UpdatedFamilyMembersRequestDto){
  //   const {parent_couple_id} = dto;

  //   if(parent_couple_id){
  //     const coupleEntity = await this.coupleRepository.findByPk(
  //       parent_couple_id, 
  //       [], 
  //       false, 
  //       {
  //         include: [
  //           {
  //             model: FamilyMembersModel,
  //             as:'partner_1',
  //             include: [
  //               {
  //                 model: UserModel,
  //                 as:'user',
  //                 attributes: ['fullname', 'id'],
  //               },
  //             ]
  //           },
  //           {
  //             model: FamilyMembersModel,
  //             as:'partner_2',
  //             include: [
  //               {
  //                 model: UserModel,
  //                 as:'user',
  //                 attributes: ['fullname', 'id'],
  //               },
  //             ]
  //           },
  //         ]
  //     });
  //     if (!coupleEntity) {
  //       throw new NotFoundException(FAMILY_MEMBERS_ERROR.PARENT_NODE_NOT_FOUND);
  //     }
      
  //     const couple = coupleEntity.toJSON();
  //     const partner_1_id = couple.partner_1?.id;
  //     const partner_2_id = couple.partner_2?.id;

  //     if (partner_1_id === id || partner_2_id === id) {
  //       throw new ConflictException('Không thể gán bản thân làm con của chính mình');
  //     }

  //   }
    
  //   return super.update(id, dto)
  // }

  async updateFamilyMembers(id: string, dto: UpdatedFamilyMembersRequestDto) {
    if (!('parent_couple_id' in dto)) {
      return; // field không được truyền -> không đụng vào quan hệ cha mẹ
    }
    const { parent_couple_id } = dto; // có thể là string hoặc null
  
    return this.baseTransactionService.runInTransaction(async (transaction) => {
      const entity = await this.repository.findByPk(id, [], false, { transaction });
      if (!entity) throw new NotFoundException(FAMILY_MEMBERS_ERROR.NODE_NOT_FOUND);
  
      let newGenerationOrder: number;
      let newChildOrder: number;
  
      if (parent_couple_id) {
         // ---- GÁN VÀO COUPLE CHA MẸ MỚI ----
         const coupleEntity = await this.coupleRepository.findByPk(parent_couple_id, [], false, {
          transaction,
          include: [{ model: FamilyMembersModel, as: 'partner_1' }],
        });
        if (!coupleEntity) throw new NotFoundException(FAMILY_MEMBERS_ERROR.PARENT_NODE_NOT_FOUND);
        const couple = coupleEntity.toJSON();
  
        if (couple.partner_1.id === id || couple.partner_2_id === id) {
          throw new ConflictException('Không thể gán bản thân làm con của chính mình');
        }
  
        const descendantIds = await this.repository.getDescendantIds(id, transaction);
        if (descendantIds.includes(couple.partner_1.id) || descendantIds.includes(couple.partner_2_id)) {
          throw new ConflictException('Không thể gán một hậu duệ làm cha/mẹ của node này (tạo vòng lặp)');
        }
  
        newGenerationOrder = couple.partner_1.generation_order + 1;
        newChildOrder = await this.generateNextChildOrder(parent_couple_id, transaction);
      } else {
        // ---- TÁCH RA LÀM CỤ TỔ ----
  
        // (Tuỳ chọn) chỉ cho phép 1 root trong hệ thống
        const existingRoot = await this.repository.findOneByField('parent_couple_id', null, ['id']);
        if (existingRoot && existingRoot.id !== id) {
          throw new ConflictException('Hệ thống đã tồn tại một cụ tổ khác');
        }
  
        newGenerationOrder = 1;
        newChildOrder = 1;
      }
      const delta = newGenerationOrder - entity.generation_order;
  
      const updated = await this.repository.update(id, {
        parent_couple_id,          // null hoặc uuid
        generation_order: newGenerationOrder,
        child_order: newChildOrder,
      }, { transaction });  
  
      if (delta !== 0) {
        const descendantIds = await this.repository.getDescendantIds(id, transaction);
        if (descendantIds.length > 0) {
          await this.repository.bulkShiftGenerationOrder(descendantIds, delta, transaction);
        }
      }   
      return updated; 
    });
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
            attributes: ['fullname'],
        };
        const coupleInclude:any = {
            model: CouplesModel,
            as: 'parent_couple',
            attributes: ['id'],
            include: [
              {
                  model: FamilyMembersModel,
                  as: 'partner_1',
                  attributes: ['id'],
                  include: [
                    {
                      model: UserModel,
                      as: 'user',
                      attributes: ['fullname'],
                    }
                  ]
              },
              {
                    model: FamilyMembersModel,
                    as: 'partner_2',
                    attributes: ['id'],
                    include: [
                      {
                        model: UserModel,
                        as: 'user',
                        attributes: ['fullname'],
                      }
                    ]
              }
            ]
        };

        if (user_id) {
            userInclude.where = {
                id: user_id,
            };

            userInclude.required = true;
        }

        options.include = [
          ...include,
          userInclude,
          coupleInclude
        ];

        return options;
    });
  }

  async getFamilyMembersDetail(id: string): Promise<GetByIdFamilyMembersResponseDto>{
    return super.getById(id, options => {
      const include = Array.isArray(options.include) ? options.include : options.include  ? [options.include] : [];
      const userInclude:any = {
        model: UserModel,
        as: 'user',
        attributes: ['fullname'],
      };

      options.include = [
        ...include,
        userInclude,
      ];
      
      return options;
    })
  }
 
  async getFamilyTree(rootId: FamilyMembersAsTreeDTO): Promise<FamilyTreeNode[]> {
    console.log('rootId', rootId);
    
    // 1. Lấy toàn bộ member kèm fullname user - 1 query duy nhất, tránh N+1
    const members: any[] = await this.familyMembersModel.findAll({
      raw: true,
      nest: true,
      attributes: ['id', 'user_id', 'parent_couple_id', 'generation_order', 'child_order'],
      include: [{ model: UserModel, as: 'user', attributes: ['id', 'fullname'] }],
    });
  
    if (members.length === 0) return [];
  
    // 2. Lấy toàn bộ couples - 1 query duy nhất
    const couples: any[] = await this.coupleRepository.findAllByRaw({
      attributes: ['id', 'partner_1_id', 'partner_2_id', 'couple_order', 'marriage_status'],
    });
  
    // 3. Build map tra cứu O(1) thay vì query lồng nhau
    const memberById = new Map<string, any>();
    members.forEach((m) => memberById.set(m.id, m));
  
    const couplesByPartner = new Map<string, any[]>(); // memberId -> các couple mà họ tham gia
    const childrenByCouple = new Map<string, any[]>();  // coupleId -> danh sách con
  
    couples.forEach((c) => {
      [c.partner_1_id, c.partner_2_id].forEach((partnerId) => {
        if (!couplesByPartner.has(partnerId)) couplesByPartner.set(partnerId, []);
        couplesByPartner.get(partnerId)!.push(c);
      });
    });
  
    members.forEach((m) => {
      if (!m.parent_couple_id) return;
      if (!childrenByCouple.has(m.parent_couple_id)) childrenByCouple.set(m.parent_couple_id, []);
      childrenByCouple.get(m.parent_couple_id)!.push(m);
    });
  
    // 4. Đệ quy build node - có "visiting" set để chống vòng lặp
    // (phòng hờ data cũ lỗi trước khi có validate cycle ở bước update, tránh stack overflow)
    const buildNode = (memberId: string, visiting: Set<string>): FamilyTreeNode | null => {
      const member = memberById.get(memberId);
      if (!member) return null;
  
      if (visiting.has(memberId)) {
        Logger.warn(`Phát hiện vòng lặp tại node ${memberId}, dừng đệ quy`);
        return {
          id: member.id,
          user_id: member.user_id,
          fullname: member.user?.fullname,
          generation_order: member.generation_order,
          child_order: member.child_order,
          couples: [],
        };
      }
      visiting.add(memberId);
  
      const myCouples = couplesByPartner.get(memberId) ?? [];
      const coupleNodes: FamilyTreeCoupleNode[] = myCouples
        .sort((a, b) => (a.couple_order ?? 1) - (b.couple_order ?? 1))
        .map((c) => {
          const partnerId = c.partner_1_id === memberId ? c.partner_2_id : c.partner_1_id;
          const partner = memberById.get(partnerId);
  
          const childMembers = (childrenByCouple.get(c.id) ?? [])
            .sort((a, b) => a.child_order - b.child_order);
  
          return {
            couple_id: c.id,
            marriage_status: c.marriage_status,
            partner: partner
              ? { id: partner.id, user_id: partner.user_id, fullname: partner.user?.fullname }
              : null,
            children: childMembers
              .map((child) => buildNode(child.id, visiting))
              .filter((n): n is FamilyTreeNode => n !== null),
          };
        });
  
      visiting.delete(memberId);
  
      return {
        id: member.id,
        user_id: member.user_id,
        fullname: member.user?.fullname,
        generation_order: member.generation_order,
        child_order: member.child_order,
        couples: coupleNodes,
      };
    };
  
    // 5. Xác định node gốc: nếu không truyền rootId thì lấy tất cả node có parent_couple_id = null
    const rootIds = rootId
      ? [rootId]
      : members.filter((m) => !m.parent_couple_id).map((m) => m.id);
  
    if (rootIds.length === 0) {
      throw new NotFoundException(FAMILY_MEMBERS_ERROR.NODE_NOT_FOUND);
    }
  
    return rootIds
      .map((id) => buildNode(id, new Set<string>()))
      .filter((n): n is FamilyTreeNode => n !== null);
  }
  // async update(nodeId: string, dto: UpdateNodeRequestDto, actor: string) {
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
  //       const existingUserInFamily = await this.repository.findByUserId(dto.userId, transaction);
  //       if (existingUserInFamily && existingUserInFamily.id !== nodeId) {
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

  async changeStatus(nodeId: string, actor: string) {
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


  // async getAllAsTree(): Promise<NodeTreeVModel> {
  //   const allfamily_members = await this.repository.findAll({ status: true });
  //   const userIds = allfamily_members?.map((n) => n.user_id) ?? [];
  //   const users = await this.userRepository.findAll(userIds);
  //   const userMap = new Map(users?.map((u) => [u.id, u]) ?? []);

  //   const rootNodeEntity = allfamily_members?.find((x) => x.parent_couple_id === null || x.parent_couple_id === undefined);
  //   if (!rootNodeEntity) {
  //     throw new NotFoundException('Family tree root not found');
  //   }

  //   return mapEntityToTree(rootNodeEntity, allfamily_members ?? [], userMap as Map<string, UserModel>);
  // }

 

  async getAllAsTree(dto): Promise<any[]> {
    const {rootNodeId, maxDepth = 10} = dto;
    // QUY TẮC 4: Có path_tracker để chống vòng lặp cứng (nếu bị lọt data lỗi) và maxDepth chống tràn bộ nhớ
    const query = `
      WITH RECURSIVE family_tree AS (
        SELECT id, user_id, parent_couple_id, generation_order, 1 AS depth,
               ARRAY[id] AS path_tracker
        FROM family_members 
        WHERE id = :rootNodeId

        UNION ALL

        SELECT fm.id, fm.user_id, fm.parent_couple_id, fm.generation_order, ft.depth + 1,
               ft.path_tracker || fm.id
        FROM family_members fm
        INNER JOIN family_tree ft ON fm.parent_couple_id = ft.parent_couple_id -- Khớp relation logic của bạn
        WHERE ft.depth < :maxDepth 
          AND fm.id != ALL(ft.path_tracker) 
      )
      SELECT * FROM family_tree;
    `;

    return this.repository.getTree(query, rootNodeId, maxDepth)
  }

  async getById(id: string){
    const entity = await this.repository.findByPkWithRelations(id);
    if (!entity) {
      return null;
    }
    return mapEntityToVModel(entity);
  }

  async getChilds(userId: string) {
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

  async getParents(userId: string) {
    const currentNode = await this.repository.findByUserId(userId);
    if (!currentNode?.parent_couple_id) {
      return [];
    }

    const parent = await this.getById(currentNode.parent_couple_id);
    return parent ? [parent] : [];
  }

  async updateNode( id: string, data: Partial<FamilyMembersModel>, transaction?: Transaction ): Promise<FamilyMembersModel | null> {
    const node = await this.repository.findByPk(id, [], false);
    if (!node) {
      return null;
    }
    await node.update(data, { transaction });
    return node;
  }
}
