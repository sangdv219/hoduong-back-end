import { Status, UserModel } from "@infrastructure/models/user.model";
import { BaseQueryBuilder } from "@shared/database/query-builder/base-query.builder";
import { Op } from "sequelize";

export class UserQueryBuilder extends BaseQueryBuilder<UserModel>{
    constructor(){
        super({ 
            searchableFields:[ "email", "fullname", "phone", "ascii_name"],
            sortableFields:["fullname", "email", "phone", "age", "created_at",  "updated_at", "status", "life_status"],
            defaultSort:"created_at",
            defaultDirection:"DESC",
        });
    }
    override build(params: Record<string, any>) {
        // 1. Lấy options cơ bản từ BaseQueryBuilder
        const options = super.build(params);
    
        // 2. Nếu client KHÔNG truyền status, áp dụng mặc định status != Status.ARCHIVED
        if (!params.status) {
          options.where = {
            ...options.where,
            status: { [Op.ne]: Status.ARCHIVED }, // hoặc 'archived' nếu không dùng Enum
          };
        }
    
        return options;
      }

}