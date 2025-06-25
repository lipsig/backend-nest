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
  };

  const mockSave = jest.fn().mockResolvedValue(mockProduto);

  const mockProdutoModel = {
    find: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockProduto]),
    }),
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockProduto),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockProduto),
    }),
    findByIdAndDelete: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockProduto),
    }),
  };

  beforeEach(async () => {
    const mockModel = function (dto) {
      return {
        ...dto,
        save: mockSave,
      };
    };

    Object.assign(mockModel, mockProdutoModel); // adiciona os métodos estáticos (find, findById, etc.)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutosService,
        {
          provide: getModelToken(Produto.name),
          useValue: mockModel,
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

      const result = await service.create(createProdutoDto);

      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockProduto);
    });
  });

  describe('findAll', () => {
    it('should return an array of produtos', async () => {
      const result = await service.findAll();

      expect(model.find).toHaveBeenCalled();
      expect(result).toEqual([mockProduto]);
    });
  });

  describe('findOne', () => {
    it('should return a produto by id', async () => {
      const result = await service.findOne('mockId');

      expect(model.findById).toHaveBeenCalledWith('mockId');
      expect(result).toEqual(mockProduto);
    });

    it('should throw NotFoundException when produto not found', async () => {
      jest.spyOn(model, 'findById').mockReturnValueOnce({
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
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValueOnce({
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

    it('should update a produto without changing slug when name is not provided', async () => {
      const updateProdutoDto: UpdateProdutoDto = {
        price: 15.99,
      };

      const updatedProduto = { ...mockProduto, ...updateProdutoDto };
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(updatedProduto),
      } as any);

      const result = await service.update('mockId', updateProdutoDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockId',
        updateProdutoDto,
        { new: true }
      );
      expect(result).toEqual(updatedProduto);
    });

    it('should throw NotFoundException when produto not found', async () => {
      const updateProdutoDto: UpdateProdutoDto = { price: 15.99 };

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.update('nonexistentId', updateProdutoDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a produto', async () => {
      await service.remove('mockId');

      expect(model.findByIdAndDelete).toHaveBeenCalledWith('mockId');
    });

    it('should throw NotFoundException when produto not found', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.remove('nonexistentId')).rejects.toThrow(NotFoundException);
    });
  });
});
