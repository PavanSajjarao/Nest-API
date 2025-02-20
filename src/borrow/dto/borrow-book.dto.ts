import { IsNotEmpty, IsDateString } from 'class-validator';

export class BorrowBookDto {
  @IsNotEmpty()
  @IsDateString()
  dueDate: string;
}
