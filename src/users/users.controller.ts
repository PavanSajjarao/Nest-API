import { 
  Controller, Get, Param, Put, Body, Delete, UseGuards 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { Role } from "../auth/enums/role.enum";
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.Admin)  
  @UseGuards(AuthGuard(), RolesGuard)  
  async getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }
  
  @Get(':id')
  @UseGuards(AuthGuard())  
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  @Roles(Role.Admin, Role.User, Role.Moderator)  
  @UseGuards(AuthGuard(), RolesGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<User>,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)  
  @UseGuards(AuthGuard(), RolesGuard)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Put(':id/soft-delete')
  @Roles(Role.Admin)  
  @UseGuards(AuthGuard(), RolesGuard)
  async softdeleteUser(@Param('id') id: string) {
    return this.usersService.softdeleteUser(id);
  }

  @Put(':id/restore')
  @Roles(Role.Admin)  
  @UseGuards(AuthGuard(), RolesGuard)
  async restoreUser(@Param('id') id: string) {
    return this.usersService.restoreUser(id);
  }

  @Get(':id/roles')
  @UseGuards(AuthGuard())  
  async getUserRoles(@Param('id') id: string): Promise<{ roles: Role[] }> {
    return this.usersService.getUserRoles(id);
  }
} 