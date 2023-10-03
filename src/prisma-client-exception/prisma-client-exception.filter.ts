import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message;

    switch (exception.code) {
      case 'P2000':
        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message,
        });
        break;
      case 'P2002':
        const lines = message.split('\n');
        const conflictLine = lines.find((line) =>
          line.includes('Unique constraint failed on the fields:'),
        );
        const match = conflictLine?.match(
          /Unique constraint failed on the fields: (.+)/,
        );
        const fields = match ? match[1] : 'unknown'; // Default to 'unknown' if not found

        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: `Conflict: Resource with duplicate ${fields} already exists`,
          fields, // Include the field(s) in the response
        });
        break;
      case 'P2025':
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message,
        });
        console.log(message);
        break;
      default:
        super.catch(exception, host);
    }
  }
}
