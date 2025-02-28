import { Controller, Post, Param, Body, Get, Put , Delete, UseGuards} from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('borrow')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}
  
  @Roles(Role.Moderator, Role.Admin , Role.User)
  @UseGuards(AuthGuard(), RolesGuard)
  @Post(':userId/:bookId')
  async borrowBook(
    @Param('userId') userId: string,
    @Param('bookId') bookId: string,
    @Body() borrowBookDto: BorrowBookDto,
  ) {
    return this.borrowService.borrowBook(userId, bookId, borrowBookDto);
  }
  
  
  @Roles(Role.Moderator, Role.Admin , Role.User)
  @UseGuards(AuthGuard(), RolesGuard)
  @Put(':userId/:bookId/return')
  async returnBook(@Param('userId') userId: string, @Param('bookId') bookId: string) {
    return this.borrowService.returnBook(userId, bookId);
  }
  
  @Roles(Role.Moderator, Role.Admin , Role.User)
  @UseGuards(AuthGuard(), RolesGuard)
  @Get('user/:userId')
  async getUserBorrowedBooks(@Param('userId') userId: string) {
    return this.borrowService.getUserBorrowedBooks(userId);
  }

  @Roles(Role.Moderator, Role.Admin)
  @UseGuards(AuthGuard(), RolesGuard)
  @UseGuards(AuthGuard())
  @Get('book/:bookId')
  async getBorrowedUsers(@Param('bookId') bookId: string) {
    return this.borrowService.getBorrowedUsers(bookId);
  }
  
  @UseGuards(AuthGuard())
  @Roles(Role.Moderator, Role.Admin)
  @Get('history')
  async getAllBorrowHistory() {
  return this.borrowService.getAllBorrowHistory();
  }

  @UseGuards(AuthGuard())
  @Roles(Role.Moderator, Role.Admin)
  @Delete(':borrowId')
  async deleteBorrowRecord(@Param('borrowId') borrowId: string) {
    return this.borrowService.deleteBorrowRecord(borrowId);
}
@UseGuards(AuthGuard())
@Roles(Role.Moderator, Role.Admin)
@Get('dashboard')
async getBorrowAnalytics() {
  return this.borrowService.getBorrowAnalytics();
}



}
