import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ArticlesModule } from './articles/articles.module';
import { ProductsModule } from './products/products.module';
import { APP_FILTER } from '@nestjs/core';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, ArticlesModule, ProductsModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
  ],
})
export class AppModule {}
