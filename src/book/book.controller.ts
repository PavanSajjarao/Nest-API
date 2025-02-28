// src/books/book.controller.ts
import { Body, Controller, Get, Param, Post, Put, Delete, Query, UseGuards, Req, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './schemas/book.schema';
import { CreateBookDto } from './dto/create-book.dto';
import { updateBookDto } from './dto/update-book.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('books')
export class BookController {
    constructor(private bookService: BookService) {}

    @Get()
    @Roles(Role.Moderator, Role.Admin , Role.User)
    @UseGuards(AuthGuard(), RolesGuard)
    async getAllBooks(@Query() query: ExpressQuery): Promise<Book[]> {
        return this.bookService.findAll(query);
    }

    @Roles(Role.Moderator, Role.Admin)
    @UseGuards(AuthGuard(), RolesGuard)
    @Post()
    async createBook(@Body() book: CreateBookDto, @Req() req): Promise<Book> {
        return this.bookService.create(book, req.user);
    }

    @Roles(Role.Moderator, Role.Admin , Role.User)
    @UseGuards(AuthGuard(), RolesGuard)
    @Get(':id')
    async getBookById(@Param('id') id: string): Promise<Book> {
        return this.bookService.findById(id);
    }

    @Roles(Role.Moderator, Role.Admin)
    @UseGuards(AuthGuard(), RolesGuard)
    @Put(':id')
    async updateBook(@Param('id') id: string, @Body() book: updateBookDto): Promise<Book> {
        return this.bookService.updateById(id, book);
    }

    @Roles(Role.Moderator, Role.Admin)
    @UseGuards(AuthGuard(), RolesGuard)
    @Delete(':id')
    async deleteBook(@Param('id') id: string): Promise<Book> {
        return this.bookService.deleteById(id);
    }
    
    @Roles(Role.Moderator, Role.Admin , Role.User)
    @UseGuards(AuthGuard(), RolesGuard)
    @Put('upload/:id')
    @UseGuards(AuthGuard())
    @UseInterceptors(FilesInterceptor('files'))
    async uploadImages(
        @Param('id') id: string,
        @UploadedFiles() files: Array<Express.Multer.File>
    ) {
        console.log(files);
        console.log(id);
        return;
    }
}
