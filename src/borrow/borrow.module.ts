import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Borrow, BorrowSchema } from './schemas/borrow.schema';
import { BorrowService } from './borrow.service';
import { BorrowController } from './borrow.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Borrow.name, schema: BorrowSchema }])],
  controllers: [BorrowController],
  providers: [BorrowService],
  exports: [BorrowService],
})
export class BorrowModule {}
