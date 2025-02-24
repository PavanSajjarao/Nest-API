import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Borrow, BorrowSchema } from './schemas/borrow.schema';
import { BorrowService } from './borrow.service';
import { BorrowController } from './borrow.controller';
import { AuthModule } from 'src/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Borrow.name, schema: BorrowSchema }])
  ],
  controllers: [BorrowController],
  providers: [
    BorrowService,
    {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
    }
  ],
  exports: [BorrowService],
})
export class BorrowModule {}
