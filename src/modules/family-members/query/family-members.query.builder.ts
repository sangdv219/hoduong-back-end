import { FamilyMembersModel } from "@infrastructure/models/family-members.model";
import { BaseQueryBuilder } from "@shared/database/query-builder/base-query.builder";

export class FamilyMembersQueryBuilder extends BaseQueryBuilder<FamilyMembersModel>{
    constructor(){
        super({ 
            searchableFields:[ "email", "fullname", "phone", "ascii_name"],
            sortableFields:["child_order", "generation_order"],
            defaultSort:"created_at",
            defaultDirection:"ASC",
        });
    }
    override build(params: Record<string, any>) {
        // 1. Lấy options cơ bản từ BaseQueryBuilder
        const options = super.build(params);
    
        // 2. Nếu client KHÔNG truyền status, áp dụng mặc định status != Status.ARCHIVED
        // if (!params.status) {
        //   options.where = {
        //     ...options.where,
        //     status: { [Op.ne]: Status.ARCHIVED }, // hoặc 'archived' nếu không dùng Enum
        //   };
        // }
    
        return options;
      }

}