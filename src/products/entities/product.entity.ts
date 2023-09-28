import { ApiProperty } from '@nestjs/swagger';
import { Prisma, Product } from '@prisma/client';

export class ProductEntity implements Product {
  @ApiProperty()
  id: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  name: string;
  @ApiProperty({ required: false, nullable: true })
  description: string | null;
  @ApiProperty()
  price: Prisma.Decimal;
  @ApiProperty()
  sku: string;
  @ApiProperty()
  published: boolean;
}
