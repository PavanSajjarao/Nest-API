// src/books/book.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Book } from './schemas/book.schema';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { User } from '../users/schemas/user.schema';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BookService {
    constructor(
        @InjectModel(Book.name) private bookModel: Model<Book>,
    ) {}

    async findAll(query: ExpressQuery): Promise<Book[]> {
        const resPerPage = 10;
        const currentPage = Number(query.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        const keyword = query.keyword ? {
            title: {
                $regex: query.keyword,
                $options: 'i'
            }
        } : {};

        const res = await this.bookModel.find({ ...keyword }).limit(resPerPage).skip(skip);
        return res;
    }
 
    async create(bookDto: CreateBookDto, user: User): Promise<Book> {
        // Merge user ID into the DTO data
        const data = { ...bookDto, user: user._id };
        return await this.bookModel.create(data);
    }

    async findById(id: string): Promise<Book> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Invalid book ID: ${id}`);
        }

        const book = await this.bookModel.findById(id).exec();
        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
        return book;
    }

    async updateById(id: string, book: Partial<Book>): Promise<Book> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Invalid book ID: ${id}`);
        }
    
        const res = await this.bookModel.findByIdAndUpdate(id, book, {
            new: true,           // Return updated document
            runValidators: true, // Run schema validations
        });
    
        if (!res) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
        return res;
    }

    async deleteById(id: string): Promise<Book> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Invalid book ID: ${id}`);
        }
    
        const book = await this.bookModel.findByIdAndDelete(id);
        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
        return book;
    }
}
