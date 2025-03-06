import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt"; 
import { User } from "./schemas/user.schema";
import { Model } from "mongoose";



@Injectable()

export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET
        })
    }

    //The validate function in the JwtStrategy class is not explicitly called by you because it's automatically invoked by Passport when it validates a JWT (JSON Web Token).

    async validate(payload:any){
        const {id} = payload;
        const user = await this.userModel.findById(id);
        console.log("Validating Function Called");
        if(!user){
           throw new UnauthorizedException(); //these exception will arise when user send valid token but in that user id is wrong then this exception arises.
        }

        return user;
    }
}