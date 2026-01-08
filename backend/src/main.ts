import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/response.interceptor';
import { AllExceptionFilter } from './common/all-exception.filter';
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { MyLoggerService } from './my-logger/my-logger.service';
import { SessionInterceptor } from './auth/session.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new MyLoggerService()
  });
  const { httpAdapter } = app.get(HttpAdapterHost);

  app.use(cookieParser());
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: false,
  }));
  app.useGlobalInterceptors(new ResponseInterceptor(), new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(app.get(SessionInterceptor));
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter));

  app.use((req, res, next) => {
    if (req.method === 'GET' && req.path.startsWith('/.well-known')) {
      res.status(204).send();
    } else {
      next();
    }
  });


  const config = new DocumentBuilder()
    .setTitle('Collab Sphere API Docs')
    .setDescription('Enterprise API documentation for your SaaS backend')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      description: 'Enter your gateToken here'
    }, 'gateTokenAuth')
    .addCookieAuth('vaultToken', {
      type: 'apiKey',
      in: 'cookie'
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  document.security = [{ gateTokenAuth: [] }];
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'CollabSphere API Docs',
    swaggerOptions: { persistAuthorization: true, useUnsafeMarkdown: false },
  });

  await app.listen(process.env.PORT ?? 3000);

}
bootstrap().then(() => Logger.log(`Server started at port: http://localhost:${process.env.PORT ?? 3000}`)).catch((e) => Logger.error(e));

