import { Request } from 'express';
import { User } from '../../users/schemas/user.schema';
import { Types } from 'mongoose';

export interface RequestWithUser extends Request {
    user: User & {
        _id: Types.ObjectId;
    };
} 