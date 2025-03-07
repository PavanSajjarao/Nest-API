import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt"; 
import { User } from "../users/schemas/user.schema";
import { Model } from "mongoose";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
            ignoreExpiration: false, // Ensure token expiration is checked
            passReqToCallback: true, // Pass request object to validate method
        });
    }

    async validate(req: any, payload: any) {
        // Check if token is blacklisted (you'll need to implement token blacklist)
        // const isBlacklisted = await this.authService.isTokenBlacklisted(req.token);
        // if (isBlacklisted) {
        //     throw new UnauthorizedException('Token has been revoked');
        // }

        // Validate user existence and status
        const user = await this.userModel.findById(payload.id);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('User account is deactivated');
        }

        // Check if token was issued before password change
        if (user.passwordChangedAt) {
            const passwordChangedTime = user.passwordChangedAt.getTime() / 1000;
            if (payload.iat < passwordChangedTime) {
                throw new UnauthorizedException('Password has been changed. Please login again');
            }
        }

        // Add user roles to request object for role-based authorization
        req.user = user;
        return user;
    }
}