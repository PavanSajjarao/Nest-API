
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { User } from "../../users/schemas/user.schema";

export enum Category {  
    ADVENTURE = 'Adventure',
    CLASSICS = 'Classics',
    CRIME = 'Crime',
    FANTASY = 'Fantasy',
}

@Schema({
    timestamps: true
})
export class Book {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    author: string;

    @Prop({ required: true })
    imageUrl: string;

    @Prop({ required: true })
    price: number;
     
    @Prop({ required: true, enum: Category })
    category: Category;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    user: User;
}

export const BookSchema = SchemaFactory.createForClass(Book);
