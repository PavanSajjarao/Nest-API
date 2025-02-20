import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';  // ✅ Import Types correctly
import { Book } from './schemas/book.schema';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { title } from 'process';
import { User } from 'src/auth/schemas/user.schema';

@Injectable()
export class BookService {
    constructor(
        @InjectModel(Book.name) private bookModel: Model<Book>,
    ) {}

    async findAll(query:ExpressQuery): Promise<Book[]> {

        const resPerPage = 2;
        const currentPage = Number(query.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        const keyword = query.keyword ? {
            title : {
                $regex: query.keyword,
                $options: 'i'
            }
        }: {}
        const res =  await this.bookModel.find({...keyword}).limit(resPerPage).skip(skip);
        return res;
    }

    async create(book: Book , user:User): Promise<Book> {
        const data = Object.assign(book, { user: user._id })
        return await this.bookModel.create(book);
    }

    async findById(id: string ,): Promise<Book> {
        // const isValidId = mongoose.isValidObjectId(id);
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Invalid book ID: ${id}`);
        }

        const book = await this.bookModel.findById(id).exec();

        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        return book;
    }

    async updateById(id: string, book: Book): Promise<Book> {
        // ✅ Validate if the ID is a valid MongoDB ObjectId
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Invalid book ID: ${id}`);
        }
    
        const res = await this.bookModel.findByIdAndUpdate(id, book, {
            new: true,           // Returns the updated document
            runValidators: true, // Ensures validation rules are applied
        });
    
        // ✅ Handle case where book is not found
        if (!res) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
    
        return res;
    }

    async deleteById(id: string): Promise<Book> {
        // ✅ Validate if the ID is a valid MongoDB ObjectId
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Invalid book ID: ${id}`);
        }
    
        const book = await this.bookModel.findByIdAndDelete(id);
    
        // ✅ Handle case where book is not found
        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
    
        return book;
    }
}
