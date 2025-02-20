import { Controller, Post, Param, Body, Get, Put , Delete} from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { BorrowBookDto } from './dto/borrow-book.dto';

@Controller('borrow')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Post(':userId/:bookId')
  async borrowBook(
    @Param('userId') userId: string,
    @Param('bookId') bookId: string,
    @Body() borrowBookDto: BorrowBookDto,
  ) {
    return this.borrowService.borrowBook(userId, bookId, borrowBookDto);
  }

  @Put(':userId/:bookId/return')
  async returnBook(@Param('userId') userId: string, @Param('bookId') bookId: string) {
    return this.borrowService.returnBook(userId, bookId);
  }

  @Get('user/:userId')
  async getUserBorrowedBooks(@Param('userId') userId: string) {
    return this.borrowService.getUserBorrowedBooks(userId);
  }

  @Get('book/:bookId')
  async getBorrowedUsers(@Param('bookId') bookId: string) {
    return this.borrowService.getBorrowedUsers(bookId);
  }

  @Get('history')
  async getAllBorrowHistory() {
  return this.borrowService.getAllBorrowHistory();
  }

  @Delete(':borrowId')
  async deleteBorrowRecord(@Param('borrowId') borrowId: string) {
    return this.borrowService.deleteBorrowRecord(borrowId);
}
@Get('dashboard')
async getBorrowAnalytics() {
  return this.borrowService.getBorrowAnalytics();
}
}
