import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseFilters,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductEntity } from './entities/product.entity';
import { PrismaClientExceptionFilter } from 'src/prisma-client-exception/prisma-client-exception.filter';
import { Page } from 'src/page/page.dto';
import { ApiPageResponse } from 'src/page/api-page-response-decorator';
import { ConnectionArgs } from 'src/page/connection-args.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('products')
@ApiTags('products')
@ApiExtraModels(Page)
@UseFilters(PrismaClientExceptionFilter)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ProductEntity })
  async create(@Body() createProductDto: CreateProductDto) {
    return new ProductEntity(
      await this.productsService.create(createProductDto),
    );
  }

  @Get()
  @ApiOkResponse({ type: ProductEntity, isArray: true })
  async findAll() {
    const products = await this.productsService.findAll();
    return products.map((product) => new ProductEntity(product));
  }

  @Get('page')
  @ApiPageResponse(ProductEntity)
  async findPage(@Query() connectionArgs: ConnectionArgs) {
    return this.productsService.findPage(connectionArgs);
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductEntity })
  async findOne(@Param('id') id: string) {
    const product = new ProductEntity(await this.productsService.findOne(id));

    if (!product) {
      return new NotFoundException(`Product with id: ${id} is not found`);
    }
    return product;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ProductEntity })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return new ProductEntity(
      await this.productsService.update(id, updateProductDto),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse({ type: ProductEntity })
  async remove(@Param('id') id: string) {
    return new ProductEntity(await this.productsService.remove(id));
  }
}
