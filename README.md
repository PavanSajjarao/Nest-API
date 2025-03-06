# Library Management System API

A robust NestJS-based REST API for managing a library system with authentication, book management, and borrowing functionality.

## Features

- 🔐 JWT Authentication
- 📚 Book Management
- 📖 Borrowing System
- 👥 Role-based Authorization
- 📝 Input Validation
- 🔒 Security Features
- 📤 File Upload Support
- 🗑️ Soft Delete Functionality

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nest-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h
```

4. Start the development server:
```bash
npm run start:dev
```

## Authentication System

### 1. Authentication Module Setup

```typescript
// src/auth/auth.module.ts
@Module({
  imports: [
    // Register Passport with JWT as default strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Configure JWT Module
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<string | number>('JWT_EXPIRES'),
          },
        };
      },
    }),

    // Register MongoDB User Schema
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema }
    ])
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
```

### 2. Authentication Flows

#### Registration Flow
```
User → POST /auth/signup
↓
Validate SignUpDto
↓
Check if user exists
↓
Hash password
↓
Create user with default role (User)
↓
Generate JWT token
↓
Return token to user
```

#### Login Flow
```
User → POST /auth/login
↓
Validate LoginDto
↓
Find user by email
↓
Verify password
↓
Generate JWT token
↓
Return token to user
```

#### Protected Route Access Flow
```
User Request → AuthGuard → JwtStrategy → RolesGuard → Route Handler
```

### 3. Authentication Endpoints

#### Register
- **POST** `/auth/register`
- Register a new user
- Required fields: email, password, name
- Returns: JWT token

Example Request:
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
}
```

#### Login
- **POST** `/auth/login`
- Login with email and password
- Required fields: email, password
- Returns: JWT token

Example Request:
```json
{
    "email": "john@example.com",
    "password": "securepassword123"
}
```

### 4. JWT Strategy Implementation

```typescript
// src/auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET
        });
    }

    async validate(payload: any) {
        const { id } = payload;
        const user = await this.userModel.findById(id);
        
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
```

### 5. User Schema

```typescript
// src/auth/schemas/user.schema.ts
@Schema()
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ type: String, enum: Role, default: Role.User })
    role: Role;
}
```

### 6. Authentication DTOs

#### SignUp DTO
```typescript
export class SignUpDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;
}
```

#### Login DTO
```typescript
export class LoginDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
```

### 7. Using Authentication in Routes

```typescript
@Controller('books')
export class BookController {
    @UseGuards(AuthGuard())  // Basic authentication
    @Get()
    async getAllBooks() {
        return this.bookService.findAll();
    }

    @UseGuards(AuthGuard(), RolesGuard)  // Authentication + Role check
    @Roles(Role.Moderator, Role.Admin)
    @Post()
    async createBook() {
        return this.bookService.create();
    }
}
```

### 8. Error Handling

- 401 Unauthorized: Invalid or missing JWT token
- 403 Forbidden: Valid token but insufficient roles
- 400 Bad Request: Invalid input data
- 409 Conflict: Email already exists

## Role-Based Authorization

### 1. Role System

```typescript
export enum Role {
    User = 'user',      // Regular users
    Admin = 'admin',    // Full system access
    Moderator = 'moderator'  // Limited administrative access
}
```

### 2. Role Guard Implementation

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requireRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if(!requireRoles) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        return matchRoles(requireRoles, user?.role);
    }
}
```

### 3. Role-Based Access Examples

1. **Public Access**:
```typescript
@Get()
@Roles(Role.User, Role.Moderator, Role.Admin)
async getAllBooks() {
    // All authenticated users can access
}
```

2. **Moderator and Admin Only**:
```typescript
@Post()
@Roles(Role.Moderator, Role.Admin)
async createBook() {
    // Only moderators and admins can create
}
```

3. **Admin Only**:
```typescript
@Delete()
@Roles(Role.Admin)
async deleteBook() {
    // Only admins can delete
}
```

## API Documentation

### Book Endpoints

#### Create Book
- **POST** `/books`
- Create a new book
- Protected route (requires authentication)
- Required fields: title, author, ISBN

#### Get All Books
- **GET** `/books`
- Retrieve all books
- Public route

#### Get Book by ID
- **GET** `/books/:id`
- Retrieve a specific book
- Public route

#### Update Book
- **PUT** `/books/:id`
- Update book details
- Protected route (requires authentication)

#### Delete Book
- **DELETE** `/books/:id`
- Soft delete a book
- Protected route (requires authentication)

### Borrowing Endpoints

#### Borrow Book
- **POST** `/borrow`
- Borrow a book
- Protected route (requires authentication)
- Required fields: bookId, dueDate

#### Return Book
- **PUT** `/borrow/:id/return`
- Return a borrowed book
- Protected route (requires authentication)

#### Get Borrowing History
- **GET** `/borrow/history`
- Get user's borrowing history
- Protected route (requires authentication)

## Security Features

- JWT Authentication
- Role-based Authorization (Admin, Moderator, User)
- Password Hashing
- Rate Limiting
- Helmet Security Headers
- Input Validation using class-validator
- Request Transformation using class-transformer

## Testing

Run the test suite:
```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Development

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Project Structure

```
src/
├── auth/           # Authentication module
├── book/           # Book management module
├── borrow/         # Borrowing system module
├── app.module.ts   # Main application module
└── main.ts         # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the UNLICENSED License.

## Book Module

### 1. Module Setup

```typescript
// src/book/book.module.ts
@Module({
  imports: [
    AuthModule,  // Import AuthModule for authentication
    MongooseModule.forFeature([
      { name: 'Book', schema: BookSchema }
    ])
  ],
  controllers: [BookController],
  providers: [BookService]
})
export class BookModule {}
```

### 2. Book Schema

```typescript
// src/book/schemas/book.schema.ts
@Schema()
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

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;
}
```

### 3. Data Transfer Objects (DTOs)

#### Create Book DTO
```typescript
// src/book/dto/create-book.dto.ts
export class CreateBookDto {
    @IsNotEmpty()
    @IsString()
    readonly title: string;

    @IsNotEmpty()
    @IsString()
    readonly description: string;

    @IsNotEmpty()
    @IsString()
    readonly author: string;

    @IsNotEmpty()
    @IsString()
    readonly imageUrl: string;

    @IsNotEmpty()
    @IsNumber()
    readonly price: number;

    @IsNotEmpty()
    @IsEnum(Category)
    readonly category: Category;

    @IsEmpty({ message: "You cannot pass userID" })
    readonly user: User;
}
```

#### Update Book DTO
```typescript
// src/book/dto/update-book.dto.ts
export class updateBookDto {
    @IsOptional()
    @IsString()
    readonly title?: string;

    @IsOptional()
    @IsString()
    readonly description?: string;

    @IsOptional()
    @IsString()
    readonly author?: string;

    @IsOptional()
    @IsString()
    readonly imageUrl?: string;

    @IsOptional()
    @IsNumber()
    readonly price?: number;

    @IsOptional()
    @IsEnum(Category)
    readonly category?: Category;

    @IsEmpty({ message: "You cannot pass userID" })
    readonly user: User;
}
```

### 4. Book Service Implementation

```typescript
// src/book/book.service.ts
@Injectable()
export class BookService {
    constructor(
        @InjectModel(Book.name) private bookModel: Model<Book>
    ) {}

    // Find all books with pagination and search
    async findAll(query: ExpressQuery): Promise<Book[]> {
        const resPerPage = 10;
        const currentPage = Number(query.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        // Search by keyword if provided
        const keyword = query.keyword ? {
            title: {
                $regex: query.keyword,
                $options: 'i'
            }
        } : {};

        return await this.bookModel
            .find({ ...keyword })
            .limit(resPerPage)
            .skip(skip);
    }

    // Create new book with user association
    async create(bookDto: CreateBookDto, user: User): Promise<Book> {
        const data = { ...bookDto, user: user._id };
        return await this.bookModel.create(data);
    }

    // Find book by ID with validation
    async findById(id: string): Promise<Book> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Invalid book ID: ${id}`);
        }

        const book = await this.bookModel.findById(id).exec();
        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
        return book;
    }

    // Update book with validation
    async updateById(id: string, book: Partial<Book>): Promise<Book> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Invalid book ID: ${id}`);
        }

        const res = await this.bookModel.findByIdAndUpdate(id, book, {
            new: true,
            runValidators: true,
        });

        if (!res) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
        return res;
    }

    // Delete book with validation
    async deleteById(id: string): Promise<Book> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Invalid book ID: ${id}`);
        }

        const book = await this.bookModel.findByIdAndDelete(id);
        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
        return book;
    }
}
```

### 5. Book Controller Implementation

```typescript
// src/book/book.controller.ts
@Controller('books')
export class BookController {
    constructor(private bookService: BookService) {}

    // Get all books with pagination and search
    @Get()
    @Roles(Role.Moderator, Role.Admin, Role.User)
    @UseGuards(AuthGuard(), RolesGuard)
    async getAllBooks(@Query() query: ExpressQuery): Promise<Book[]> {
        return this.bookService.findAll(query);
    }

    // Create new book
    @Post()
    @Roles(Role.Moderator, Role.Admin)
    @UseGuards(AuthGuard(), RolesGuard)
    async createBook(@Body() book: CreateBookDto, @Req() req): Promise<Book> {
        return this.bookService.create(book, req.user);
    }

    // Get book by ID
    @Get(':id')
    @Roles(Role.Moderator, Role.Admin, Role.User)
    @UseGuards(AuthGuard(), RolesGuard)
    async getBookById(@Param('id') id: string): Promise<Book> {
        return this.bookService.findById(id);
    }

    // Update book
    @Put(':id')
    @Roles(Role.Moderator, Role.Admin)
    @UseGuards(AuthGuard(), RolesGuard)
    async updateBook(@Param('id') id: string, @Body() book: updateBookDto): Promise<Book> {
        return this.bookService.updateById(id, book);
    }

    // Delete book
    @Delete(':id')
    @UseGuards(AuthGuard())
    async deleteBook(@Param('id') id: string): Promise<Book> {
        return this.bookService.deleteById(id);
    }
}
```

### 6. Book Module Flow

1. **Request Flow**:
```
Client Request → BookController → AuthGuard → RolesGuard → BookService → MongoDB
```

2. **Data Validation**:
   - Input validation using DTOs
   - MongoDB ObjectId validation
   - Role-based access control
   - User authentication

3. **Error Handling**:
   - 400 Bad Request: Invalid input data
   - 401 Unauthorized: Missing/invalid token
   - 403 Forbidden: Insufficient roles
   - 404 Not Found: Book not found

4. **Features**:
   - Pagination
   - Search functionality
   - Role-based access control
   - User association with books
   - Input validation
   - Error handling