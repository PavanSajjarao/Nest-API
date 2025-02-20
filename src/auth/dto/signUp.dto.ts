import { IsNotEmpty, IsString, IsEmail, MinLength, IsOptional, IsArray, ArrayUnique, ArrayNotEmpty, IsEnum } from "class-validator";
import { Role } from "../enums/role.enum";




export class SignUpDto {

    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    readonly password: string;

    @IsOptional()
    @IsArray()
    @IsEnum(Role, { each: true })
    readonly role: string[];
   

    

}