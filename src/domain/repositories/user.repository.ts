import { UserModel } from "@infrastructure/models/user.model";
import { BaseRepository, IBaseRepository } from "./base.repository";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";

export interface IUserRepository extends IBaseRepository<UserModel>{}

@Injectable()
export class UserRepository extends BaseRepository<UserModel> implements IUserRepository {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
  ) {
    // Truyền model và các cột muốn tìm kiếm theo từ khóa (keyword) vào lớp cha
    super(userModel, ['fullname', 'other_name', 'email', 'phone', 'gender', 'age', 'birth_date']);
  }
}