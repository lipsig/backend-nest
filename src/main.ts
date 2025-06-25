import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, 
      transform: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(3000);
  console.log('🚀 Aplicação rodando em http://localhost:3000');
}
bootstrap();
