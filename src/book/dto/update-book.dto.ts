// src/books/dto/update-book.dto.ts
import { IsEnum, IsNumber, IsOptional, IsString, IsEmpty } from "class-validator";
import { Category } from "../schemas/book.schema";
import { User } from "../../users/schemas/user.schema";

export class updateBookDto {
    @IsOptional()
    @IsString()
    readonly title?: string;

    @IsOptional()
    @IsString()
    readonly description?: string;

    @IsOptional()
    @IsString()
    readonly author?: string;

    @IsOptional()
    @IsString()
    readonly imageUrl?: string;

    @IsOptional()
    @IsNumber()
    readonly price?: number;

    @IsOptional()
    @IsEnum(Category)
    readonly category?: Category;

    @IsEmpty({ message: "You cannot pass userID" })
    readonly user: User;
}
