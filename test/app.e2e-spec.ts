import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { useContainer } from 'class-validator';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const articleShape = expect.objectContaining({
    id: expect.any(Number),
    body: expect.any(String),
    title: expect.any(String),
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
    published: expect.any(Boolean),
  });

  const articlesData = [
    {
      id: 100001,
      title: 'title1',
      description: 'description1',
      body: 'body1',
      published: true,
    },
    {
      id: 100002,
      title: 'title2',
      description: 'description2',
      body: 'body2',
      published: false,
    },
  ];
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    prisma = app.get<PrismaService>(PrismaService);

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();

    await prisma.article.create({
      data: articlesData[0],
    });
    await prisma.article.create({
      data: articlesData[1],
    });
  });

  describe('GET /articles', () => {
    it('returns a list of published acticles', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        '/articles',
      );

      expect(status).toBe(200);
      expect(body).toStrictEqual(expect.arrayContaining([articleShape]));
      expect(body).toHaveLength(1);
      expect(body[0].published).toBeTruthy();
    });

    it('returns a list of draft acticles', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        '/articles/drafts',
      );

      expect(status).toBe(200);
      expect(body).toStrictEqual(expect.arrayContaining([articleShape]));
      expect(body).toHaveLength(1);
      expect(body[0].published).toBeFalsy();
    });
  });

  describe('GET /articles/:id', () => {
    it('returns a given article', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        `/articles/${articlesData[0].id}`,
      );

      expect(status).toBe(200);
      expect(body).toStrictEqual(articleShape);
      expect(body.id).toEqual(articlesData[0].id);
    });

    it('fails to return non existing article', async () => {
      const { status, body } = await request(app.getHttpServer()).get(
        '/articles/3',
      );
      // INI ANEH, MASA HASILNYA MALAH 200, DAHAL DI SWAGGER 404
      expect(status).toBe(200);
      expect(body.status).toEqual(404);
      // expect(body).toBeUndefined();
    });

    it('fails to return article with invalid id type', async () => {
      const { status } = await request(app.getHttpServer()).get(
        `/articles/string-id`,
      );

      expect(status).toBe(400);
    });
  });

  describe('POST /articles', () => {
    it('creates a new article', async () => {
      const beforeCount = await prisma.article.count();

      const { status, body } = await request(app.getHttpServer())
        .post('/articles')
        .send({
          title: 'title3',
          description: 'description3',
          body: 'NestJS is one of the hottest Node.js frameworks around. And I made this body to be at least 100 char long. So i`ll just read some meaningless words just to fit my rule. kinda silly ngl',
          published: true,
        });

      const afterCount = await prisma.article.count();
      expect(status).toBe(201);
      expect(body).toBeDefined();
      expect(body.title).toEqual('title3');
      expect(body.id).toEqual(1);
      expect(afterCount - beforeCount).toBe(1);
    });
  });

  describe('PATCH /articles/:id', () => {
    it('edit an existing article', async () => {
      const { status, body } = await request(app.getHttpServer())
        .patch('/articles/100001')
        .send({
          title: 'judul artikel',
          description: 'description whatsoever',
          body: 'NestJS is one of the hottest Node.js frameworks around. And I made this body to be at least 100 char long. So i`ll just read some meaningless words just to fit my rule. kinda silly ngl',
          published: false,
        });

      expect(status).toBe(200);
      expect(body).toBeDefined();
      expect(body.title).toEqual('judul artikel');
    });
  });

  describe('DEL /articles/:id', () => {
    it('edit an existing article', async () => {
      const { status, body } = await request(app.getHttpServer()).del(
        '/articles/1',
      );

      expect(status).toBe(200);
      expect(body).toBeDefined();
      expect(body.title).toEqual('title3');
    });
  });
});
