import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProdutosModule } from './produtos/produtos.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        console.log('🚀 MongoDB em memória iniciado em:', uri);
        return { uri };
      }
    }),
    ProdutosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}