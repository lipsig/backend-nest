import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { Produto } from './schemas/produto.schema';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

describe('ProdutosService', () => {
  let service: ProdutosService;
  let model: Model<Produto>;

  const mockProduto = {
    _id: 'mockId',
    name: 'Test Product',
    description: 'Test Description',
    slug: 'test-product',
    price: 10.99,
    category: 'Test Category',
    available: true,
    preparationTime: 15,
    save: jest.fn().mockResolvedValue(this),
  };

  const mockProdutoModel = {
    new: jest.fn().mockResolvedValue(mockProduto),
    constructor: jest.fn().mockResolvedValue(mockProduto),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutosService,
        {
          provide: getModelToken(Produto.name),
          useValue: mockProdutoModel,
        },
      ],
    }).compile();

    service = module.get<ProdutosService>(ProdutosService);
    model = module.get<Model<Produto>>(getModelToken(Produto.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new produto', async () => {
      const createProdutoDto: CreateProdutoDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        category: 'Test Category',
      };

      const saveSpy = jest.fn().mockResolvedValue(mockProduto);
      const constructorSpy = jest.spyOn(model, 'constructor' as any).mockImplementation(() => ({
        save: saveSpy,
      }));

      const result = await service.create(createProdutoDto);

      expect(constructorSpy).toHaveBeenCalledWith({
        ...createProdutoDto,
        slug: 'test-product',
      });
      expect(saveSpy).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of produtos', async () => {
      const produtos = [mockProduto];
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(produtos),
      } as any);

      const result = await service.findAll();

      expect(model.find).toHaveBeenCalled();
      expect(result).toEqual(produtos);
    });
  });

  describe('findOne', () => {
    it('should return a produto by id', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduto),
      } as any);

      const result = await service.findOne('mockId');

      expect(model.findById).toHaveBeenCalledWith('mockId');
      expect(result).toEqual(mockProduto);
    });

    it('should throw NotFoundException when produto not found', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.findOne('nonexistentId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a produto', async () => {
      const updateProdutoDto: UpdateProdutoDto = {
        name: 'Updated Product',
        price: 15.99,
      };

      const updatedProduto = { ...mockProduto, ...updateProdutoDto, slug: 'updated-product' };

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedProduto),
      } as any);

      const result = await service.update('mockId', updateProdutoDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockId',
        { ...updateProdutoDto, slug: 'updated-product' },
        { new: true }
      );
      expect(result).toEqual(updatedProduto);
    });

    it('should throw NotFoundException when produto not found', async () => {
      const updateProdutoDto: UpdateProdutoDto = { price: 15.99 };

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.update('nonexistentId', updateProdutoDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a produto', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduto),
      } as any);

      await service.remove('mockId');

      expect(model.findByIdAndDelete).toHaveBeenCalledWith('mockId');
    });

    it('should throw NotFoundException when produto not found', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.remove('nonexistentId')).rejects.toThrow(NotFoundException);
    });
  });
});
