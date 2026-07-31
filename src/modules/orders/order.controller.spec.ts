import { PaginationQueryDto } from '@shared/dto/common';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CreatedCartRequestDto,
  UpdatedCartRequestDto,
} from './dto/order.request.dto';
import { CartService } from './services/order.service';

// DTO và model giả định (thay theo dự án thật)

describe('CartController', () => {
  let controller: CartController;
  let service: jest.Mocked<CartService & { create: jest.Mock<any, any> }>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            getPagination: jest.fn(),
            getById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPagination', () => {
    it('gọi service.getPagination và trả về kết quả', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10 };
      const expected: any = {
        success: true,
        data: [
          {
            id: '1',
            name: 'Nike',
            image: '',
            is_public: true,
            created_at: new Date(),
            updated_at: new Date(),
            // add other required CartModel properties with mock values here
          },
        ],
        totalRecord: 1,
      };
      service.getPagination.mockResolvedValue(expected);

      const result = await controller.getPagination(query);

      expect(service.getPagination).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('getCartById', () => {
    it('trả về Cart khi tồn tại', async () => {
      const Cart: any = {
        id: '1',
        name: 'Adidas',
        image: '',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
        // add other required CartModel properties with mock values here
      };
      service.getById.mockResolvedValue(Cart);

      const result = await controller.getCartById('1');

      expect(service.getById).toHaveBeenCalledWith('1');
      expect(result).toEqual(Cart);
    });

    it('ném NotFound khi service trả về null', async () => {
      service.getById.mockRejectedValue(new NotFoundException('Not found'));

      await expect(controller.getCartById('404')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('gọi service.create và trả về kết quả', async () => {
      const dto: CreatedCartRequestDto = {
        name: 'Puma',
        image: '',
        is_public: true,
      };
      const expected = { id: '1', name: 'Puma' };
      service.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('updateCart', () => {
    it('gọi service.update và trả về void', async () => {
      const dto: UpdatedCartRequestDto = {
        name: 'Reebok',
        image: 'sd',
        is_public: true,
      };
      service.update.mockResolvedValue(undefined);

      const result = await controller.updateCart('1', dto);

      expect(service.update).toHaveBeenCalledWith('1', dto);
      expect(result).toBeUndefined();
    });
  });

  describe('deleteCart', () => {
    it('gọi service.delete và trả về void', async () => {
      service.delete.mockResolvedValue(undefined);

      const result = await controller.deleteCart('1');

      expect(service.delete).toHaveBeenCalledWith('1');
      expect(result).toBeUndefined();
    });
  });
});
