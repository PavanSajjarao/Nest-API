import { SetMetadata } from "@nestjs/common";
import { Role } from "../enums/role.enum";

//this is going to be our key then we have to set meta data
export const ROLES_KEY = 'roles';

export const  Roles = (...roles:Role[]) => SetMetadata(ROLES_KEY, roles);