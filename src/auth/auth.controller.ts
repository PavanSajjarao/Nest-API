import { Controller, Post, Body , Param , Delete , Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signUp.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/signup')
    signUp(@Body() signUpDto: SignUpDto): Promise<{ token: string }> {
        return this.authService.signUp(signUpDto);
    }

    @Post('/login')
    login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
        return this.authService.login(loginDto);
    }
    
    // Actual deleting user from db
    @Delete('/delete/:id')
    async deleteUser(@Param('id') userId: string) {
        return this.authService.deleteUser(userId);
    }
   
    //Soft Deleteing from DB
    @Put('/delete/:id')
    async softdeleteUser(@Param('id') id: string) {
        return this.authService.softdeleteUser(id);
    }

    @Put('/restore/:id')
    async restoreUser(@Param('id') id: string) {
        return this.authService.restoreUser(id);
    }
}
