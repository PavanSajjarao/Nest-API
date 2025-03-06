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
      

    /**
   * Get all users (including active and inactive).
   */
  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userModel.find({isActive:true});
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  /**
   * Get a single user by ID.
   */
  async getUserById(userId: string): Promise<User> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Update an existing user's fields.
   */
  async updateUser(
    userId: string,
    updateUserDto: Partial<User>,
  ): Promise<User> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      updateUserDto,
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  /**
   * Permanently delete a user from the database.
   */
  async deleteUser(userId: string): Promise<{ message: string }> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userModel.findByIdAndDelete(userId);
    return { message: 'User successfully deleted' };
  }

  /**
   * Soft-delete a user (set isActive = false).
   */
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

  /**
   * Restore a soft-deleted user (set isActive = true).
   */
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

  async getUserRoles(userId: string): Promise<{ roles: Role[] }> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
  
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    return { roles: user.role };
  }
  
    
}
