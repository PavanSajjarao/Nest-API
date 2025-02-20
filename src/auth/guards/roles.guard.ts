import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Role } from "../enums/role.enum";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate{ //canActive is an interface so we need to override methods
     
    constructor(
        private reflector: Reflector //HelperClass to access our metaData
     ){}

    canActivate(context: ExecutionContext): boolean {
        const requireRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY , [
            context.getHandler(),
            context.getClass(),
        ]);

        if(!requireRoles) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;


        return matchRoles(requireRoles, user?.role);
        
    }

}

function matchRoles(requireRoles:string[], userRoles:string[]){
    return requireRoles.some((role:string) => userRoles?.includes(role))
}