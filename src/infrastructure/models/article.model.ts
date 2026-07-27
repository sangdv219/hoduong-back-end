import { BaseModel } from '@shared/model/base.model';
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { UserModel } from './user.model';

@Table({
  tableName: 'articles',
  timestamps: true,
  underscored: true,
})
export class ArticleModel extends BaseModel<ArticleModel> {
  @PrimaryKey
  @Default(Sequelize.literal('gen_random_uuid()'))
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare user_id: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(50) })
  declare name: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(50) })
  declare alias: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(100) })
  declare description: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(50) })
  declare short_description: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(50) })
  declare thumbnailFile_id: string | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING(50) })
  declare attachmentFile: string | null;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare countView: number;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare is_approve: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_highlight: boolean;

  @BelongsTo(() => UserModel, 'user_id')
  declare user: UserModel;
}

