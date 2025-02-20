import { IsEnum, IsNumber, IsOptional, IsString , IsEmpty } from "class-validator";
import { Category } from "../schemas/book.schema";
import { User } from "src/auth/schemas/user.schema";


export class updateBookDto {

    @IsOptional()
    @IsString()
    readonly title: string;

    @IsOptional()
    @IsString()
    readonly description: string;

    @IsOptional()
    @IsString()
    readonly author : string;

    @IsOptional()
    @IsNumber()
    readonly price: number;

    @IsOptional()
    @IsEnum(Category)
    readonly category: Category;

    @IsEmpty({message:"You Cannot Pass UserID"})  //user cannot pass in body so i put empty its been added automatically
    readonly user:User;
    

}