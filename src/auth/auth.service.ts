import { Injectable, UnauthorizedException, ConflictException} from '@nestjs/common';
import { User } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signUp.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from "./enums/role.enum";



@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        private jwtService: JwtService
    ) {}

    async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
        const { name, email, password, role } = signUpDto;
    
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser && existingUser.isActive) {
            throw new ConflictException('Email is already in use');
        }
    
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Set default role if not provided
        const userRole = role && role.length > 0 ? role : [Role.User];
    
        // Create user
        const user = await this.userModel.create({
            name,
            email,
            password: hashedPassword,
            role: userRole,
            isActive: true,
        });
    
        // Generate token
        const tokenPayload = { id: user._id, role: user.role };
        const token = this.jwtService.sign(tokenPayload);
    
        return { token };
    }
    

     
    async login(loginDto: LoginDto): Promise<{ token: string }> {
        const { email, password } = loginDto;
  
        const user = await this.userModel.findOne({ email, isActive: true });
        if (!user) {
          throw new UnauthorizedException('Invalid email or password');
        }
      
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
          throw new UnauthorizedException('Invalid password');
        }
      
        // Include role in the token payload
        const tokenPayload = { id: user._id, role: user.role };
        const token = this.jwtService.sign(tokenPayload);
        return { token };
      }
}
