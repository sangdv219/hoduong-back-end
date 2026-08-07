import { CouplesModel } from "@infrastructure/models/couples.model";
import { RedisService } from "@redis/redis.service";
import { BaseService } from "@core/services/base.service";
import { Injectable, Logger } from "@nestjs/common";
import { InjectConnection } from "@nestjs/sequelize";
import { Sequelize } from "sequelize";
import { CouplesRepository } from "@modules/couples/repository/couples.repository";
import { CreatedCouplesRequestDto, ICouplesPaginationDTO, UpdatedCouplesRequestDto } from "@modules/couples/dto/couples.request.dto";
import { GetAllCouplesResponseDto, GetByIdCouplesResponseDto } from "@modules/couples/dto/couples.response.dto";
import { UserModel } from "@infrastructure/models/user.model";
import { FamilyMembersModel } from "@infrastructure/models/family-members.model";

@Injectable()
export class CoupleService extends BaseService<
  CouplesModel,
  CreatedCouplesRequestDto,
  UpdatedCouplesRequestDto,
  GetByIdCouplesResponseDto,
  GetAllCouplesResponseDto
  > {
    protected entityName: string;
    private users: string[] = [];
    protected readonly getAllDtoClass = GetAllCouplesResponseDto;
    protected readonly getByIdDtoClass = GetByIdCouplesResponseDto;
    constructor(
      @InjectConnection()
      private readonly sequelize: Sequelize,
      protected repository: CouplesRepository,
      public cacheManage: RedisService,
    ) {
      super(repository);
      this.searchableFields = [ 'email' ];
      this.entityName = 'couples';
    }

    protected async moduleInit() {
        this.users = ['Iphone', 'Galaxy'];
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
        this.users = [];
        Logger.log('🗑️onModuleDestroy -> users: ', this.users);
      }

      async searchCouples(params: ICouplesPaginationDTO):Promise<GetAllCouplesResponseDto |any>{
        const { user_id, family_member_id, ...baseParams } = params;
    return super.search(baseParams, params, options => {

        const include = Array.isArray(options.include)
            ? options.include
            : options.include
                ? [options.include]
                : [];

        const userInclude:any = {
            model: UserModel,
            attributes: ['fullname'],
            // through: {
            //     attributes: [],
            // },
        };

        const familyMembersInclude:any = {
            model: FamilyMembersModel,
            attributes: [],
            // through: {
            //     attributes: [],
            // },
        };

        if (user_id) {
            userInclude.where = {
                id: user_id,
            };

            userInclude.required = true;
        }
        if (family_member_id) {
            familyMembersInclude.where = {
                id: family_member_id,
            };

            familyMembersInclude.required = true;
        }

        options.include = [
            ...include,
            userInclude,
            familyMembersInclude,
        ];

        return options;
    });
      }

      async getCouplesById(id: string): Promise<GetByIdCouplesResponseDto | null>{
        return super.getById(id, options => {
            const include = Array.isArray(options.include) ? options.include : options.include  ? [options.include] : [];
            const userInclude:any = {
                model: UserModel,
                attributes: ['id','name'],
                through: {
                    attributes: [],
                },
            };
            options.include = [
                ...include,
                userInclude,
            ];
            return options;
          })
      }

      async create(dto: CreatedCouplesRequestDto){
        return super.create(dto)
      }
  }