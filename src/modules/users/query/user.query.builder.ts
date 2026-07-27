import { UserModel } from "@/infrastructure/models/user.model";
import { BaseQueryBuilder } from "@/shared/database/query-builder/base-query.builder";

export class UserQueryBuilder extends BaseQueryBuilder<UserModel>{
    constructor(){
        super({ 
            searchableFields:[ "email", "fullname", "phone", "ascii_name"],
            sortableFields:["fullname", "email", "phone", "age", "created_at",  "updated_at", "status", "life_status"],
            defaultSort:"created_at",
            defaultDirection:"DESC",
        });
    }

}