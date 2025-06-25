import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Produto } from '../src/produtos/schemas/produto.schema';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let produtoModel: Model<Produto>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    produtoModel = moduleFixture.get<Model<Produto>>(getModelToken(Produto.name));
    
    await app.init();
  });

  afterEach(async () => {
    await produtoModel.deleteMany({});
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/produtos (e2e)', () => {
    const validProduto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 10.99,
      category: 'Test Category',
      preparationTime: 15,
    };

    describe('POST /produtos', () => {
      it('should create a new produto', () => {
        return request(app.getHttpServer())
          .post('/produtos')
          .send(validProduto)
          .expect(201)
          .expect((res) => {
            expect(res.body.name).toBe(validProduto.name);
            expect(res.body.slug).toBe('test-product');
            expect(res.body.price).toBe(validProduto.price);
            expect(res.body.available).toBe(true);
          });
      });

      it('should fail with invalid data', () => {
        return request(app.getHttpServer())
          .post('/produtos')
          .send({ name: '', price: -10 })
          .expect(400);
      });

      it('should fail with non-whitelisted properties', () => {
        return request(app.getHttpServer())
          .post('/produtos')
          .send({ ...validProduto, invalidField: 'test' })
          .expect(400);
      });
    });

    describe('GET /produtos', () => {
      it('should return empty paginated response initially', () => {
        return request(app.getHttpServer())
          .get('/produtos')
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual({
              produtos: [],
              total: 0,
              pages: 0
            });
          });
      });

      it('should return paginated produtos', async () => {
        await request(app.getHttpServer())
          .post('/produtos')
          .send(validProduto);

        return request(app.getHttpServer())
          .get('/produtos')
          .expect(200)
          .expect((res) => {
            expect(res.body.produtos).toHaveLength(1);
            expect(res.body.produtos[0].name).toBe(validProduto.name);
            expect(res.body.produtos[0].category).toBe(validProduto.category.toLowerCase());
            expect(res.body.total).toBe(1);
            expect(res.body.pages).toBe(1);
          });
      });
    });

    describe('GET /produtos/:id', () => {
      it('should return a produto by id', async () => {
        const createResponse = await request(app.getHttpServer())
          .post('/produtos')
          .send(validProduto);

        const produtoId = createResponse.body._id;

        return request(app.getHttpServer())
          .get(`/produtos/${produtoId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body._id).toBe(produtoId);
            expect(res.body.name).toBe(validProduto.name);
          });
      });

      it('should return 404 for non-existent produto', () => {
        return request(app.getHttpServer())
          .get('/produtos/507f1f77bcf86cd799439011')
          .expect(404);
      });

      it('should return 500 for invalid ObjectId', () => {
        return request(app.getHttpServer())
          .get('/produtos/invalid-id')
          .expect(500);
      });
    });

    describe('PUT /produtos/:id', () => {
      it('should update a produto', async () => {
        const createResponse = await request(app.getHttpServer())
          .post('/produtos')
          .send(validProduto);

        const produtoId = createResponse.body._id;
        const updateData = { name: 'Updated Product', price: 15.99 };

        return request(app.getHttpServer())
          .put(`/produtos/${produtoId}`)
          .send(updateData)
          .expect(200)
          .expect((res) => {
            expect(res.body.name).toBe(updateData.name);
            expect(res.body.price).toBe(updateData.price);
            expect(res.body.slug).toBe('updated-product');
          });
      });

      it('should return 404 for non-existent produto', () => {
        return request(app.getHttpServer())
          .put('/produtos/507f1f77bcf86cd799439011')
          .send({ name: 'Updated' })
          .expect(404);
      });
    });

    describe('DELETE /produtos/:id', () => {
      it('should delete a produto', async () => {
        const createResponse = await request(app.getHttpServer())
          .post('/produtos')
          .send(validProduto);

        const produtoId = createResponse.body._id;

        await request(app.getHttpServer())
          .delete(`/produtos/${produtoId}`)
          .expect(200);

        return request(app.getHttpServer())
          .get(`/produtos/${produtoId}`)
          .expect(404);
      });

      it('should return 404 for non-existent produto', () => {
        return request(app.getHttpServer())
          .delete('/produtos/507f1f77bcf86cd799439011')
          .expect(404);
      });
    });
  });
});
