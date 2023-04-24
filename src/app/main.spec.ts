import { Test } from '@nestjs/testing';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { type NestFastifyApplication } from '@nestjs/platform-fastify/interfaces';
import { type INestApplication } from '@nestjs/common';

describe('Main', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    const config = new DocumentBuilder()
      .addSecurity('bearer', {
        type: 'http',
        scheme: 'bearer',
      })
      .setTitle('NestJS Repository Pattern')
      .setDescription('Repository for initialize the project.')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    await app.init();
    await app.listen(process.env.PORT ?? 3000, '0.0.0.0'); // Adiciona esta linha
  });

  afterAll(async () => {
    await app.close();
  });

  it('should start the application', async () => {
    const server = app.getHttpServer();
    const url = await app.getUrl();
    expect(server).toBeDefined();
    expect(url).toBeDefined();
  });
});
