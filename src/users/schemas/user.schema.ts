import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';
import { Role } from "../../auth/enums/role.enum";

@Schema({
    timestamps: true
})
export class User extends Document {
    @Prop()
    name: string;

    @Prop({ unique: [true, 'Duplicate email enter']})
    email: string;

    @Prop()
    password: string;

    @Prop({
        type: [{type: String, enum: Role}],
        default: [Role.User],
    })
    role: Role[];

    @Prop({ default: true }) // Soft delete flag
    isActive: boolean;

    @Prop()
    passwordChangedAt?: Date;

    @Prop()
    passwordResetToken?: string;

    @Prop()
    passwordResetExpires?: Date;

    @Prop()
    emailVerificationToken?: string;

    @Prop({ default: false })
    isEmailVerified: boolean;

    @Prop()
    lastLogin?: Date;

    @Prop({ default: 0 })
    loginAttempts: number;

    @Prop()
    lockUntil?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User); 