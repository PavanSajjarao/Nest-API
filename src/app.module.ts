import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './book/book.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { BorrowModule } from './borrow/borrow.module';
import mongoose from 'mongoose';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 5, // Time window in seconds time to live
        limit: 3, // Max requests in time window 3 req.
      },
    ]),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI || ''),
    BookModule,
    AuthModule,
    BorrowModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
 
}
