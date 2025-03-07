// src/books/dto/create-book.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsEmpty } from "class-validator";
import { Category } from "../schemas/book.schema";
import { User } from "../../users/schemas/user.schema";

export class CreateBookDto {
    @IsNotEmpty()
    @IsString()
    readonly title: string;

    @IsNotEmpty()
    @IsString()
    readonly description: string;

    @IsNotEmpty()
    @IsString()
    readonly author: string;

    @IsNotEmpty({ message: 'Image URL is required' })
    @IsString()
    readonly imageUrl: string;

    @IsNotEmpty()
    @IsNumber()
    readonly price: number;

    @IsNotEmpty()
    @IsEnum(Category, { message: 'Please enter a correct category' })
    readonly category: Category;

    @IsEmpty({ message: "You cannot pass userID" })
    readonly user: User;
}
