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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductEntity } from './entities/product.entity';
import { PrismaClientExceptionFilter } from 'src/prisma-client-exception/prisma-client-exception.filter';

@Controller('products')
@ApiTags('products')
@UseFilters(PrismaClientExceptionFilter)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiCreatedResponse({ type: ProductEntity })
  @ApiConflictResponse({ description: 'Conflict: Resource already exists' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOkResponse({ type: ProductEntity, isArray: true })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductEntity })
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);

    if (!product) {
      return new NotFoundException(`Product with id: ${id} is not found`);
    }
    return product;
  }

  @Patch(':id')
  @ApiOkResponse({ type: ProductEntity })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiNoContentResponse({ type: ProductEntity })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
