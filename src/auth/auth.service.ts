import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signUp.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from "./enums/role.enum";
import * as mongoose from 'mongoose';
@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        private jwtService: JwtService
    ) {}

    async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
        const { name, email, password, role } = signUpDto;
    
        // Ensure email is trimmed and lowercase
        // const normalizedEmail = email.trim().toLowerCase();
    
        // Check for duplicate email (including soft-deleted users)
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
        const token = this.jwtService.sign({ id: user._id });
    
        return { token };
    }
    

    // async login(loginDto: LoginDto): Promise<{ token: string }> {
    //     const { email, password } = loginDto;

    //     const user = await this.userModel.findOne({ email, isActive: true });

    //     if (!user) {
    //         throw new UnauthorizedException('Invalid email or password');
    //     }

    //     const isPasswordMatched = await bcrypt.compare(password, user.password);
    //     if (!isPasswordMatched) {
    //         throw new UnauthorizedException('Invalid password');
    //     }

    //     const token = this.jwtService.sign({ id: user._id });
    //     return { token };
    // }
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
      

    // Soft Delete User (Deactivate Account)

    async softdeleteUser(userId: string): Promise<{ message: string }> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.isActive) {
            throw new BadRequestException('User is already deactivated');
        }

        user.isActive = false;
        await user.save();

        return { message: 'User account deactivated successfully' };
    }

    // Restore Soft-Deleted User
    async restoreUser(userId: string): Promise<{ message: string }> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.isActive) {
            throw new BadRequestException('User is already active');
        }

        user.isActive = true;
        await user.save();

        return { message: 'User account restored successfully' };
    }
    async deleteUser(userId: string): Promise<{ message: string }> {
        // Check if the provided ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('Invalid user ID format');
        }
    
        // Find the user by ID
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
    
        // Delete the user
        await this.userModel.findByIdAndDelete(userId);
    
        return { message: 'User successfully deleted' };
    }
    
}
