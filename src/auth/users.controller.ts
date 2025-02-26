import { Controller, Get, Param, Put, Body, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import { Role } from "./enums/role.enum";

@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.authService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.authService.getUserById(id);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<User>,
  ): Promise<User> {
    return this.authService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @Put(':id/soft-delete')
  async softdeleteUser(@Param('id') id: string) {
    return this.authService.softdeleteUser(id);
  }

  @Put(':id/restore')
  async restoreUser(@Param('id') id: string) {
    return this.authService.restoreUser(id);
  }

  @Get(':id/roles')
async getUserRoles(@Param('id') id: string): Promise<{ roles: Role[] }> {
  return this.authService.getUserRoles(id);
}

}
