import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const logger = new Logger('HTTP');

  // // Log all incoming requests to identify the source
  // app.use((req, res, next) => {
  //   logger.log(`Incoming request: ${req.method} ${req.url}`);
  //   next();
  // });

  app.use(helmet());
  app.enableCors({
    origin: ['http://localhost:4200'],
  });
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
