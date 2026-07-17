import { BaseTransactionService } from '@/infrastructure/database/transaction.service';
import { PostgresUserRepository } from '@modules/users/repository/user.admin.repository';
import { ROOT_TREE_LEVEL } from '@modules/couples/constants/couple.constant';
import { PostgresCoupleRepository } from '@modules/couples/repository/postgres-couple.repository';
import { NODE_ERROR } from '@modules/nodes/constants/node.constant';
import {
  CreateNodeRequestDto,
  NodeFilterQueryDto,
  NodeGetVModel,
  NodePaginationModel,
  NodeTreeVModel,
  UpdateNodeRequestDto,
} from '@modules/nodes/dto/node.dto';
import {
  mapEntityToTree,
  mapEntityToVModel,
} from '@modules/nodes/helpers/node.mapper';
import { PostgresNodeRepository } from '@modules/nodes/repository/postgres-node.repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transaction } from 'sequelize';
import { NodeModel } from '@/infrastructure/models/node.model';
import { UserEntity } from '@/infrastructure/models/user.model';

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
    private readonly nodeRepository: PostgresNodeRepository,
    private readonly coupleRepository: PostgresCoupleRepository,
    private readonly userRepository: PostgresUserRepository,
    private readonly baseTransactionService: BaseTransactionService,
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

    const parentNode = await this.nodeRepository.findByUserId(parentUserId, transaction);
    if (!parentNode) {
      throw new NotFoundException(NODE_ERROR.PARENT_NODE_NOT_FOUND);
    }

    return this.attachToParentNode(newUserId, parentNode.id, 1, transaction, parentUserId);
  }

  async create(dto: CreateNodeRequestDto, actor: string): Promise<NodeGetVModel> {
    return this.baseTransactionService.runInTransaction(async (transaction) => {
      const user = await this.userRepository.findByPk(dto.userId, [], false, { transaction });
      if (!user) {
        throw new NotFoundException(NODE_ERROR.USER_NOT_FOUND);
      }

      const existingNode = await this.nodeRepository.findByUserId(dto.userId, transaction);
      if (existingNode) {
        throw new ConflictException(NODE_ERROR.USER_ALREADY_HAS_NODE);
      }

      let node: NodeModel;

      if (!dto.parentId) {
        node = await this.createRootNode(dto, actor, transaction);
      } else {
        node = await this.createChildNode(dto, actor, transaction);
      }

      if (dto.coupleUserId) {
        await this.createSpouseCouple(dto.coupleUserId, node.id, node, transaction);
      }

      const created = await this.nodeRepository.findByPkWithRelations(node.id, transaction);
      return mapEntityToVModel(created!);
    });
  }

  async update(nodeId: string, dto: UpdateNodeRequestDto, actor: string): Promise<NodeGetVModel> {
    return this.baseTransactionService.runInTransaction(async (transaction) => {
      const entity = await this.nodeRepository.findByPk(nodeId, [], false, { transaction });
      if (!entity) {
        throw new NotFoundException(NODE_ERROR.NODE_NOT_FOUND);
      }

      if (dto.userId && dto.userId !== entity.user_id) {
        const user = await this.userRepository.findByPk(dto.userId, [], false, { transaction });
        if (!user) {
          throw new NotFoundException(NODE_ERROR.USER_NOT_FOUND);
        }
        const existingNode = await this.nodeRepository.findByUserId(dto.userId, transaction);
        if (existingNode && existingNode.id !== nodeId) {
          throw new ConflictException(NODE_ERROR.USER_ALREADY_HAS_NODE);
        }
      }

      if (dto.members !== undefined && dto.members !== entity.members) {
        if (!entity.parent_id && !dto.parentId) {
          throw new BadRequestException(NODE_ERROR.CANNOT_PROVIDE_MEMBERS_WITHOUT_PARENT);
        }
        const parentId = dto.parentId ?? entity.parent_id;
        if (parentId) {
          await this.validateMemberOrder(parentId, dto.members, nodeId, transaction);
        }
      }

      await this.nodeRepository.updateNode(
        nodeId,
        {
          user_id: dto.userId ?? entity.user_id,
          parent_id: dto.parentId ?? entity.parent_id,
          members: dto.members ?? entity.members,
          is_active: dto.is_active ?? entity.is_active,
          updated_by: actor,
        },
        transaction,
      );

      const updated = await this.nodeRepository.findByPkWithRelations(nodeId, transaction);
      return mapEntityToVModel(updated!);
    });
  }

  async remove(nodeId: string, actor: string): Promise<void> {
    await this.baseTransactionService.runInTransaction(async (transaction) => {
      const entity = await this.nodeRepository.findByPk(nodeId, [], false, { transaction });
      if (!entity) {
        throw new NotFoundException(NODE_ERROR.NODE_NOT_FOUND);
      }

      if (!entity.parent_id) {
        throw new BadRequestException(NODE_ERROR.CANNOT_DELETE_ROOT_NODE);
      }

      const child = await this.nodeRepository.findByParentId(nodeId, transaction);
      if (child) {
        throw new BadRequestException(NODE_ERROR.CANNOT_DELETE_NODE_WITH_CHILDREN);
      }

      await this.nodeRepository.softDeactivate(nodeId, actor, transaction);
      await this.coupleRepository.deactivateByNodeId(nodeId, transaction);
      await this.nodeRepository.decrementMembers(entity.parent_id!, transaction);
    });
  }

  async changeStatus(nodeId: string, actor: string): Promise<NodeGetVModel> {
    const entity = await this.nodeRepository.findByPk(nodeId);
    if (!entity) {
      throw new NotFoundException(NODE_ERROR.NODE_NOT_FOUND);
    }

    await this.nodeRepository.updateNode(nodeId, {
      is_active: !entity.is_active,
      updated_by: actor,
    });

    const updated = await this.nodeRepository.findByPkWithRelations(nodeId);
    return mapEntityToVModel(updated!);
  }

  async detachMemberByUserId(userId: string, transaction?: Transaction): Promise<void> {
    const run = async (tx: Transaction) => {
      const node = await this.nodeRepository.findByUserId(userId, tx);
      if (!node || !node.is_active) {
        return;
      }

      if (!node.parent_id) {
        await this.nodeRepository.softDeactivate(node.id, 'system', tx);
        await this.coupleRepository.deactivateByNodeId(node.id, tx);
        return;
      }

      const child = await this.nodeRepository.findByParentId(node.id, tx);
      if (child) {
        throw new BadRequestException(NODE_ERROR.CANNOT_DELETE_NODE_WITH_CHILDREN);
      }

      await this.nodeRepository.softDeactivate(node.id, 'system', tx);
      await this.coupleRepository.deactivateByUserId(userId, tx);
      await this.nodeRepository.decrementMembers(node.parent_id, tx);
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

    const { items, total } = await this.nodeRepository.search({
      page,
      limit,
      keyword: query.keyword ?? '',
      orderBy: 'created_at',
    });

    const records: NodeGetVModel[] = [];
    for (const node of items) {
      const detail = await this.getById(node.id);
      if (detail) {
        records.push(detail);
      }
    }

    return { records, totalRecords: total };
  }

  async getAllAsTree(): Promise<NodeTreeVModel> {
    const allNodes = await this.nodeRepository.findAll({ is_active: true });
    const userIds = allNodes?.map((n) => n.user_id) ?? [];
    const users = await this.userRepository.findAll(userIds);
    const userMap = new Map(users?.map((u) => [u.id, u]) ?? []);

    const rootNodeEntity = allNodes?.find((x) => x.parent_id === null || x.parent_id === undefined);
    if (!rootNodeEntity) {
      throw new NotFoundException('Family tree root not found');
    }

    return mapEntityToTree(rootNodeEntity, allNodes ?? [], userMap as Map<string, UserEntity>);
  }

  async getById(id: string): Promise<NodeGetVModel | null> {
    const entity = await this.nodeRepository.findByPkWithRelations(id);
    if (!entity) {
      return null;
    }
    return mapEntityToVModel(entity);
  }

  async getChilds(userId: string): Promise<NodeGetVModel[]> {
    const parentNode = await this.nodeRepository.findByUserId(userId);
    if (!parentNode) {
      return [];
    }

    const childNode = await this.nodeRepository.findByParentId(parentNode.id);
    if (!childNode) {
      return [];
    }

    const child = await this.nodeRepository.findByPkWithRelations(childNode.id);
    return child ? [mapEntityToVModel(child)] : [];
  }

  async getParents(userId: string): Promise<NodeGetVModel[]> {
    const currentNode = await this.nodeRepository.findByUserId(userId);
    if (!currentNode?.parent_id) {
      return [];
    }

    const parent = await this.getById(currentNode.parent_id);
    return parent ? [parent] : [];
  }

  private async attachToParentNode(
    newUserId: string,
    parentNodeId: string,
    members: number,
    transaction: Transaction,
    parentUserId?: string,
  ): Promise<TreeAttachmentResult> {
    const existingNode = await this.nodeRepository.findByUserId(newUserId, transaction);
    if (existingNode) {
      throw new ConflictException(NODE_ERROR.USER_ALREADY_HAS_NODE);
    }

    const parentNode = await this.nodeRepository.findByPk(parentNodeId, [], false, { transaction });
    if (!parentNode) {
      throw new NotFoundException(NODE_ERROR.PARENT_NODE_NOT_FOUND);
    }

    const existingChild = await this.nodeRepository.findByParentId(parentNodeId, transaction);
    if (existingChild) {
      throw new ConflictException(NODE_ERROR.PARENT_ALREADY_HAS_CHILD);
    }

    const parentCouple = await this.coupleRepository.findByUserId(parentNode.user_id, transaction);
    const level = (parentCouple?.level ?? ROOT_TREE_LEVEL) + 1;

    const childNode = await this.nodeRepository.create(
      {
        user_id: newUserId,
        parent_id: parentNodeId,
        members,
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

    await this.nodeRepository.incrementMembers(parentNodeId, transaction);

    return {
      nodeId: childNode.id,
      coupleId: couple.id,
      level,
      parentNodeId,
      parentUserId: parentUserId ?? parentNode.user_id,
    };
  }

  private async createRootNode(
    dto: CreateNodeRequestDto,
    actor: string,
    transaction: Transaction,
  ): Promise<NodeModel> {
    const existingRoot = await this.nodeRepository.findRootNode(transaction);
    if (existingRoot) {
      throw new ConflictException(NODE_ERROR.ROOT_NODE_ALREADY_EXISTS);
    }

    if (dto.members !== undefined && dto.members !== null) {
      throw new BadRequestException(NODE_ERROR.CANNOT_PROVIDE_MEMBERS_WITHOUT_PARENT);
    }

    const node = await this.nodeRepository.create(
      {
        user_id: dto.userId,
        parent_id: null,
        members: 1,
        is_active: dto.is_active ?? true,
        created_by: actor,
      },
      { transaction },
    );

    await this.coupleRepository.create(
      {
        user_id: dto.userId,
        node_id: node.id,
        level: ROOT_TREE_LEVEL,
        is_active: true,
      },
      { transaction },
    );

    return node as NodeModel;
  }

  private async createChildNode(
    dto: CreateNodeRequestDto,
    actor: string,
    transaction: Transaction,
  ): Promise<NodeModel> {
    const parentNode = await this.nodeRepository.findByPk(dto.parentId!, [], false, { transaction });
    if (!parentNode) {
      throw new NotFoundException(NODE_ERROR.PARENT_NODE_NOT_FOUND);
    }

    const members = dto.members ?? 1;
    await this.validateMemberOrder(dto.parentId!, members, undefined, transaction);

    const attachment = await this.attachToParentNode(
      dto.userId,
      dto.parentId!,
      members,
      transaction,
    );

    await this.nodeRepository.updateNode(
      attachment.nodeId,
      { created_by: actor },
      transaction,
    );

    return (await this.nodeRepository.findByPk(attachment.nodeId, [], false, { transaction })) as NodeModel;
  }

  private async createSpouseCouple(
    coupleUserId: string,
    nodeId: string,
    node: NodeModel,
    transaction: Transaction,
  ): Promise<void> {
    if (coupleUserId === node.user_id) {
      throw new BadRequestException(NODE_ERROR.CANNOT_ATTACH_TO_SELF);
    }

    const spouse = await this.userRepository.findByPk(coupleUserId, [], false, { transaction });
    if (!spouse) {
      throw new NotFoundException(NODE_ERROR.USER_NOT_FOUND);
    }

    const existingSpouseNode = await this.nodeRepository.findByUserId(coupleUserId, transaction);
    if (existingSpouseNode) {
      throw new ConflictException(NODE_ERROR.COUPLE_USER_ALREADY_HAS_NODE);
    }

    const ownerCouple = await this.coupleRepository.findByUserId(node.user_id, transaction);
    const level = ownerCouple?.level ?? ROOT_TREE_LEVEL;

    await this.coupleRepository.create(
      {
        user_id: coupleUserId,
        node_id: nodeId,
        level,
        is_active: true,
      },
      { transaction },
    );
  }

  private async validateMemberOrder(
    parentId: string,
    members: number,
    excludeNodeId: string | undefined,
    transaction: Transaction,
  ): Promise<void> {
    const sibling = await this.nodeRepository.findByParentId(parentId, transaction);
    if (sibling && sibling.id !== excludeNodeId && sibling.members === members) {
      throw new BadRequestException(NODE_ERROR.MEMBER_ORDER_ALREADY_EXISTS);
    }
  }
}
