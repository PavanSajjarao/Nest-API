import { Body, Controller , Get , Param, Post , Put , Delete, Query, UseGuards, Req, UseInterceptors, UploadedFiles} from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './schemas/book.schema';
import { CreateBookDto } from './dto/create-book.dto';
import { updateBookDto } from './dto/update-book.dto';
import { Query as ExpressQuery} from 'express-serve-static-core';
import { query } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
@Controller('books')
export class BookController {
    constructor(
        private bookService: BookService 
    ){}

    //@SkipThrottle()
    @Throttle({ default: {limit:1, ttl: 2000 }})
    @Get()
    @Roles(Role.Moderator, Role.Admin)
    @UseGuards(AuthGuard() , RolesGuard)
    async getAllBooks(@Query() query:ExpressQuery): Promise<Book[]>{
        return this.bookService.findAll(query);

    }


    @Post()
    @UseGuards(AuthGuard())
    async createBook(
        @Body()
        book:CreateBookDto,
        @Req() req,
    ):Promise<Book>{
        
   
        return this.bookService.create(book , req.user);
    }



    @Get(':id')
    async getBookById( @Param('id') id:string): Promise<Book>{
        return this.bookService.findById(id);
    }
    


    @Put(':id')
    async updateBook(@Param('id') id:string , @Body() book:updateBookDto): Promise<Book>{
        return this.bookService.updateById(id , book);
    }



    @Delete(':id')
    async deleteBook( @Param('id') id: string):Promise<Book>{
        return this.bookService.deleteById(id);
    }
     
    
    @Put('upload/:id')
    @UseGuards(AuthGuard())
    @UseInterceptors(FilesInterceptor('files'))
    async uploadImages(
        @Param('id') id: string,
        @UploadedFiles() files:Array<Express.Multer.File>
    ){
        console.log(files);
        console.log(id);

        return;
    }

   
}


