import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Borrow } from './schemas/borrow.schema';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { ReturnBookDto } from './dto/return-book.dto';

@Injectable()
export class BorrowService {
  constructor(@InjectModel(Borrow.name) private borrowModel: Model<Borrow>) {}

  // Borrow a Book
  async borrowBook(userId: string, bookId: string, borrowBookDto: BorrowBookDto) {
    const existingRecord = await this.borrowModel.findOne({ userId, bookId, returned: false });
    if (existingRecord) {
      throw new BadRequestException('This book is already borrowed by the user.');
    }

    const borrowedBook = new this.borrowModel({
      userId,
      bookId,
      borrowedDate: new Date(),
      dueDate: new Date(borrowBookDto.dueDate),
      returned: false,
    });

    return borrowedBook.save();
  }

  // Return a Book
  async returnBook(userId: string, bookId: string) {
    const borrowRecord = await this.borrowModel.findOneAndUpdate(
      { userId, bookId, returned: false },
      { returned: true },
      { new: true },
    );

    if (!borrowRecord) {
      throw new NotFoundException('No active borrow record found for this user and book.');
    }

    return borrowRecord;
  }

  // Get Books Borrowed by a User
  async getUserBorrowedBooks(userId: string) {
    return this.borrowModel.find({ userId, returned: false }).populate('bookId');
  }

  // Get Users Who Borrowed a Specific Book
  async getBorrowedUsers(bookId: string) {
    return this.borrowModel.find({ bookId, returned: false }).populate('userId');
  }
}
