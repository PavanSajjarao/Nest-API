import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Borrow, BorrowSchema } from './schemas/borrow.schema';
import { BorrowService } from './borrow.service';
import { BorrowController } from './borrow.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Borrow.name, schema: BorrowSchema }]),
    PassportModule
  ],
  controllers: [BorrowController],
  providers: [
    BorrowService,
  ],
  exports: [BorrowService],
})
export class BorrowModule {}
