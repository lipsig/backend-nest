import { Test, TestingModule } from '@nestjs/testing';
import { ProdutosController } from './produtos.controller';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProdutosController', () => {
  let controller: ProdutosController;
  let service: ProdutosService;

  const mockProduto = {
    _id: 'mockId',
    name: 'Test Product',
    description: 'Test Description',
    slug: 'test-product',
    price: 10.99,
    category: 'Test Category',
    available: true,
    preparationTime: 15,
  };

  const mockProdutosService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutosController],
      providers: [
        {
          provide: ProdutosService,
          useValue: mockProdutosService,
        },
      ],
    }).compile();

    controller = module.get<ProdutosController>(ProdutosController);
    service = module.get<ProdutosService>(ProdutosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new produto', async () => {
      const createProdutoDto: CreateProdutoDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        category: 'Test Category',
      };

      mockProdutosService.create.mockResolvedValue(mockProduto);

      const result = await controller.create(createProdutoDto);

      expect(service.create).toHaveBeenCalledWith(createProdutoDto);
      expect(result).toEqual(mockProduto);
    });
  });

  describe('findAll', () => {
    it('should return an array of produtos', async () => {
      const produtos = [mockProduto];
      mockProdutosService.findAll.mockResolvedValue(produtos);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(produtos);
    });
  });

  describe('findOne', () => {
    it('should return a produto by id', async () => {
      mockProdutosService.findOne.mockResolvedValue(mockProduto);

      const result = await controller.findOne('mockId');

      expect(service.findOne).toHaveBeenCalledWith('mockId');
      expect(result).toEqual(mockProduto);
    });

    it('should throw NotFoundException when produto not found', async () => {
      mockProdutosService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('nonexistentId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a produto', async () => {
      const updateProdutoDto: UpdateProdutoDto = {
        name: 'Updated Product',
        price: 15.99,
      };

      const updatedProduto = { ...mockProduto, ...updateProdutoDto };
      mockProdutosService.update.mockResolvedValue(updatedProduto);

      const result = await controller.update('mockId', updateProdutoDto);

      expect(service.update).toHaveBeenCalledWith('mockId', updateProdutoDto);
      expect(result).toEqual(updatedProduto);
    });

    it('should throw NotFoundException when produto not found', async () => {
      const updateProdutoDto: UpdateProdutoDto = { price: 15.99 };
      mockProdutosService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('nonexistentId', updateProdutoDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a produto', async () => {
      mockProdutosService.remove.mockResolvedValue(undefined);

      await controller.remove('mockId');

      expect(service.remove).toHaveBeenCalledWith('mockId');
    });

    it('should throw NotFoundException when produto not found', async () => {
      mockProdutosService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('nonexistentId')).rejects.toThrow(NotFoundException);
    });
  });
});
