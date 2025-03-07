import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import * as session from 'express-session';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('HTTP');

  // 1. Enable Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],  // Only allow resources from same origin
        scriptSrc: ["'self'", "'unsafe-inline'"],  // Allow scripts from same origin and inline
        styleSrc: ["'self'", "'unsafe-inline'"],   // Allow styles from same origin and inline
        imgSrc: ["'self'", "data:", "https:"],     // Allow images from same origin, data URLs, and HTTPS
      },
    },
    crossOriginEmbedderPolicy: true,  // Prevent documents from loading in iframes
    crossOriginOpenerPolicy: { policy: "same-origin" }, // Prevent cross-origin popups
    crossOriginResourcePolicy: { policy: "same-site" }, // Restrict resource sharing
  }));

  // 2. Configure CORS properly
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    maxAge: 3600, // Cache preflight requests for 1 hour
  });

  // 3. Configure Session Management
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      httpOnly: true, // Prevent client-side access to cookies
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      sameSite: 'strict' // Protect against CSRF
    },
  }));

  // 4. Configure Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
    transform: true, // Automatically transform payloads
    transformOptions: {
      enableImplicitConversion: true
    },
    disableErrorMessages: process.env.NODE_ENV === 'production' // Hide detailed errors in production
  }));

  // 5. Request Logging Middleware
  app.use((req, res, next) => {
    logger.log(`${req.method} ${req.url} - IP: ${req.ip}`);
    next();
  });

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
