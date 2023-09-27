import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ArticlesModule } from './articles/articles.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [PrismaModule, ArticlesModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
