import { CouplesModel } from "@infrastructure/models/couples.model";
import { RedisService } from "@redis/redis.service";
import { BaseService } from "@core/services/base.service";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectConnection } from "@nestjs/sequelize";
import { Sequelize } from "sequelize";
import { CouplesRepository } from "@modules/couples/repository/couples.repository";
import { CreatedCouplesRequestDto, ICouplesPaginationDTO, IMarriageStatus, IUpdateCoupleDto, UpdatedCouplesRequestDto } from "@modules/couples/dto/couples.request.dto";
import { GetAllCouplesResponseDto, GetByIdCouplesResponseDto } from "@modules/couples/dto/couples.response.dto";
import { UserModel } from "@infrastructure/models/user.model";
import { FamilyMembersModel } from "@infrastructure/models/family-members.model";
import { COUPLE_ERROR } from "@modules/couples/constants/couple.constant";
import { MarriageStatusStrategyFactory } from "@modules/couples/strategies/couplesStatusStrategy";

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
      private readonly marriageStatusStrategyFactory: MarriageStatusStrategyFactory, 
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
        const { partner_1_id, partner_2_id, ...baseParams } = params;
        return super.search(baseParams, params, options => {

        const include = Array.isArray(options.include)
            ? options.include
            : options.include
                ? [options.include]
                : [];


        const partner1Include:any = {
            model: FamilyMembersModel,
            as: 'partner_1',
            attributes: ['id', 'user_id'],
            include: [
                {
                    model: UserModel,
                    as: 'user',
                    attributes: ['fullname']
                }
            ]
        };
        const partner2Include:any = {
            model: FamilyMembersModel,
            as: 'partner_2',
            attributes: ['user_id'],
            include: [
                {
                    model: UserModel,
                    as: 'user',
                    attributes: ['fullname']
                }
            ]
        };

 
        if (partner_1_id) {
            partner1Include.where = { id: partner_1_id };
            partner1Include.required = true;
        }

        if (partner_2_id) {
            partner2Include.where = { id: partner_2_id };
            partner2Include.required = true;
        }

        options.include = [
            ...include,
            partner1Include,
            partner2Include,
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
        const {partner_1_id, partner_2_id} = dto;
        if(partner_1_id === partner_2_id) throw new BadRequestException(COUPLE_ERROR.CANNOT_SET_RELATION_MARRIE_WITH_YOUSELF);
        const [sorted_partner_1, sorted_partner_2] = [partner_1_id, partner_2_id].sort()
        


        return super.create({
          ...dto, 
          partner_1_id: sorted_partner_1,
          partner_2_id: sorted_partner_2,
        })
      }

      async update(id: string, dto:IUpdateCoupleDto){
        const transaction = await this.sequelize.transaction();
        const couple = await CouplesModel.findByPk(id, {
          include: [
            {
              association: 'partner_1',
              include: ['user'], // Eager load UserModel cho partner_1
            },
            {
              association: 'partner_2',
              include: ['user'], // Eager load UserModel cho partner_2
            },
          ],
          transaction,
        });
        
        if (!couple) {
          throw new BadRequestException('Couple not found.');
        }
    
    
        const strategy = this.marriageStatusStrategyFactory.getStrategy(dto.marriage_status);
    
        // 3. Chuẩn bị Context
        const context: IMarriageStatus = {
          couple,
          dto,
          partner1: couple.partner_1,
          partner2: couple.partner_2,
        };
    
        strategy.validateTransition(context);
        await strategy.handleLogic(couple, context, transaction);
 
        return couple;
      }

  }