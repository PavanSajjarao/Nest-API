import { 
  Controller, Get, Param, Put, Body, Delete, UseGuards 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import { Role } from "./enums/role.enum";
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @Roles(Role.Admin)  
  @UseGuards(AuthGuard(), RolesGuard)  
  async getAllUsers(): Promise<User[]> {
    return this.authService.getAllUsers();
  }
  
  @Get(':id')
  @UseGuards(AuthGuard())  
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.authService.getUserById(id);
  }

  @Put(':id')
  @Roles(Role.Admin, Role.User, Role.Moderator)  
  @UseGuards(AuthGuard(), RolesGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<User>,
  ): Promise<User> {
    return this.authService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)  
  @UseGuards(AuthGuard(), RolesGuard)
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @Put(':id/soft-delete')
  @Roles(Role.Admin)  
  @UseGuards(AuthGuard(), RolesGuard)
  async softdeleteUser(@Param('id') id: string) {
    return this.authService.softdeleteUser(id);
  }

  @Put(':id/restore')
  @Roles(Role.Admin)  
  @UseGuards(AuthGuard(), RolesGuard)
  async restoreUser(@Param('id') id: string) {
    return this.authService.restoreUser(id);
  }

  @Get(':id/roles')
  @UseGuards(AuthGuard())  
  async getUserRoles(@Param('id') id: string): Promise<{ roles: Role[] }> {
    return this.authService.getUserRoles(id);
  }
}
