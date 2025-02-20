import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Borrow extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  borrowedDate: Date;

  @Prop({ type: Date, required: true })
  dueDate: Date; 

  @Prop({ type: Boolean, default: false })
  returned: boolean;
}

export const BorrowSchema = SchemaFactory.createForClass(Borrow);
