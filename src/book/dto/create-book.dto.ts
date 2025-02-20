import { IsNotEmpty, IsString , IsNumber , IsEnum, IsEmpty } from "class-validator";
import { Category } from "../schemas/book.schema";
import { User } from "src/auth/schemas/user.schema";



export class CreateBookDto {

    @IsNotEmpty()
    @IsString()
    readonly title: string;

    @IsNotEmpty()
    @IsString()
    readonly description: string;

    @IsNotEmpty()
    @IsString()
    readonly author : string;

    @IsNotEmpty()
    @IsNumber()
    readonly price: number;

    @IsNotEmpty()
    @IsEnum(Category, {message: 'please enter correct category'})
    readonly category: Category;

    @IsEmpty({message:"You Cannot Pass UserID"})  //user cannot pass in body so i put empty its been added automatically
    readonly user:User;
    

}