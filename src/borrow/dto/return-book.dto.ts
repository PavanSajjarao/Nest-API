import { IsNotEmpty } from 'class-validator';

export class ReturnBookDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  bookId: string;
}
