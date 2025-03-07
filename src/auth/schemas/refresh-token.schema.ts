import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema({
    timestamps: true,
})
export class RefreshToken extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: User;

    @Prop({ required: true })
    token: string;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ default: false })
    revoked: boolean;

    @Prop()
    revokedAt: Date;

    @Prop({ required: true })
    userAgent: string;

    @Prop({ required: true })
    ipAddress: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken); 