import { IsNotEmpty, IsString ,IsEmail, MinLength } from "class-validator";




export class LoginDto {


    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    readonly password: string;    

}