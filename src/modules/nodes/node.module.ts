import { CoupleModel } from '@/infrastructure/models/couple.model';
import { NodeModel } from '@/infrastructure/models/node.model';
import { UserEntity } from '@/infrastructure/models/user.model';
import { PostgresCoupleRepository } from '@modules/couples/repository/postgres-couple.repository';
import { PostgresNodeRepository } from '@modules/nodes/repository/postgres-node.repository';
import { NodeService } from '@modules/nodes/services/node.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostgresUserRepository } from '@modules/users/repository/user.admin.repository';
import { NodeController } from './controller/node.controller';

@Module({
  imports: [SequelizeModule.forFeature([NodeModel, CoupleModel, UserEntity])],
  providers: [
    PostgresNodeRepository,
    PostgresCoupleRepository,
    PostgresUserRepository,
    NodeService,
  ],
  controllers: [NodeController],
  exports: [PostgresNodeRepository, PostgresCoupleRepository, NodeService],
})
export class NodeModule {}
