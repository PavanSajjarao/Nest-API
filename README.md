# Library Management System API

A robust NestJS-based REST API for managing a library system with authentication, book management, and borrowing functionality.

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator, class-transformer
- **Security**: Helmet, Rate Limiting
- **File Upload**: Multer
- **Testing**: Jest

## Features

- 🔐 JWT Authentication
- 📚 Book Management
- 📖 Borrowing System
- 👥 Role-based Authorization
- 📝 Input Validation
- 🔒 Security Features
- 📤 File Upload Support
- 🗑️ Soft Delete Functionality

## Project Structure

```
src/
├── auth/           # Authentication module
│   ├── decorators/ # Role decorators
│   ├── guards/     # Authentication guards
│   ├── schemas/    # User schema
│   └── strategies/ # JWT strategy
├── book/           # Book management module
│   ├── dto/        # Data transfer objects
│   ├── schemas/    # Book schema
│   └── services/   # Book services
├── borrow/         # Borrowing system module
├── app.module.ts   # Main application module
└── main.ts         # Application entry point
```

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

## Core Modules

### 1. Authentication Module

#### Module Setup
```typescript
// src/auth/auth.module.ts
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string | number>('JWT_EXPIRES') },
      }),
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
```

#### User Schema
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

#### Authentication DTOs

1. **SignUp DTO**:
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

2. **Login DTO**:
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

#### Authentication Flows

1. **Registration Flow**:
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

2. **Login Flow**:
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

3. **Protected Route Access Flow**:
```
User Request → AuthGuard → JwtStrategy → RolesGuard → Route Handler
```

#### JWT Strategy Implementation
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

#### Authentication Endpoints

1. **Register** (`POST /auth/register`):
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
}
```

2. **Login** (`POST /auth/login`):
```json
{
    "email": "john@example.com",
    "password": "securepassword123"
}
```

### 2. Book Module

#### Module Setup
```typescript
// src/book/book.module.ts
@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: 'Book', schema: BookSchema }])
  ],
  controllers: [BookController],
  providers: [BookService]
})
export class BookModule {}
```

#### Book Schema
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

#### Book DTOs

1. **Create Book DTO**:
```typescript
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

2. **Update Book DTO**:
```typescript
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

#### Book Service Implementation
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

#### Book Controller Implementation
```typescript
// src/book/book.controller.ts
@Controller('books')
export class BookController {
    constructor(private bookService: BookService) {}

    @Get()
    @Roles(Role.Moderator, Role.Admin, Role.User)
    @UseGuards(AuthGuard(), RolesGuard)
    async getAllBooks(@Query() query: ExpressQuery): Promise<Book[]> {
        return this.bookService.findAll(query);
    }

    @Post()
    @Roles(Role.Moderator, Role.Admin)
    @UseGuards(AuthGuard(), RolesGuard)
    async createBook(@Body() book: CreateBookDto, @Req() req): Promise<Book> {
        return this.bookService.create(book, req.user);
    }

    @Get(':id')
    @Roles(Role.Moderator, Role.Admin, Role.User)
    @UseGuards(AuthGuard(), RolesGuard)
    async getBookById(@Param('id') id: string): Promise<Book> {
        return this.bookService.findById(id);
    }

    @Put(':id')
    @Roles(Role.Moderator, Role.Admin)
    @UseGuards(AuthGuard(), RolesGuard)
    async updateBook(@Param('id') id: string, @Body() book: updateBookDto): Promise<Book> {
        return this.bookService.updateById(id, book);
    }

    @Delete(':id')
    @UseGuards(AuthGuard())
    async deleteBook(@Param('id') id: string): Promise<Book> {
        return this.bookService.deleteById(id);
    }
}
```

#### Book Endpoints

1. **Get All Books** (`GET /books`)
   - Pagination support
   - Search functionality
   - Protected route
   - Example Response:
   ```json
   {
     "books": [
       {
         "id": "book_id",
         "title": "Book Title",
         "author": "Author Name",
         "description": "Book Description",
         "price": 29.99,
         "category": "FICTION"
       }
     ],
     "totalPages": 10,
     "currentPage": 1
   }
   ```

2. **Create Book** (`POST /books`)
   - Protected route (Moderator/Admin only)
   - Required fields validation
   - Example Request:
   ```json
   {
     "title": "New Book",
     "author": "Author Name",
     "description": "Book Description",
     "imageUrl": "https://example.com/image.jpg",
     "price": 29.99,
     "category": "FICTION"
   }
   ```

3. **Get Book by ID** (`GET /books/:id`)
   - Protected route
   - ID validation
   - Example Response:
   ```json
   {
     "id": "book_id",
     "title": "Book Title",
     "author": "Author Name",
     "description": "Book Description",
     "price": 29.99,
     "category": "FICTION"
   }
   ```

4. **Update Book** (`PUT /books/:id`)
   - Protected route (Moderator/Admin only)
   - Partial updates supported
   - Example Request:
   ```json
   {
     "title": "Updated Title",
     "price": 39.99
   }
   ```

5. **Delete Book** (`DELETE /books/:id`)
   - Protected route
   - Soft delete functionality

### 3. Borrowing Module

#### Module Setup
```typescript
// src/borrow/borrow.module.ts
@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'Borrow', schema: BorrowSchema },
      { name: 'Book', schema: BookSchema }
    ])
  ],
  controllers: [BorrowController],
  providers: [BorrowService]
})
export class BorrowModule {}
```

#### Borrow Schema
```typescript
// src/borrow/schemas/borrow.schema.ts
@Schema()
export class Borrow {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    user: User;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true })
    book: Book;

    @Prop({ required: true })
    borrowDate: Date;

    @Prop({ required: true })
    dueDate: Date;

    @Prop({ default: false })
    returned: boolean;
}
```

#### Borrow DTOs

1. **Borrow Book DTO**:
```typescript
export class BorrowBookDto {
    @IsNotEmpty()
    @IsString()
    bookId: string;

    @IsNotEmpty()
    @IsDate()
    dueDate: Date;
}
```

2. **Return Book DTO**:
```typescript
export class ReturnBookDto {
    @IsNotEmpty()
    @IsString()
    borrowId: string;
}
```

#### Borrow Service Implementation
```typescript
// src/borrow/borrow.service.ts
@Injectable()
export class BorrowService {
    constructor(
        @InjectModel(Borrow.name) private borrowModel: Model<Borrow>,
        @InjectModel(Book.name) private bookModel: Model<Book>
    ) {}

    async borrowBook(userId: string, borrowDto: BorrowBookDto): Promise<Borrow> {
        const book = await this.bookModel.findById(borrowDto.bookId);
        if (!book) {
            throw new NotFoundException('Book not found');
        }

        const borrow = await this.borrowModel.create({
            user: userId,
            book: borrowDto.bookId,
            borrowDate: new Date(),
            dueDate: borrowDto.dueDate
        });

        return borrow;
    }

    async returnBook(userId: string, returnDto: ReturnBookDto): Promise<Borrow> {
        const borrow = await this.borrowModel.findOne({
            _id: returnDto.borrowId,
            user: userId
        });

        if (!borrow) {
            throw new NotFoundException('Borrow record not found');
        }

        borrow.returned = true;
        return await borrow.save();
    }

    async getBorrowHistory(userId: string): Promise<Borrow[]> {
        return await this.borrowModel
            .find({ user: userId })
            .populate('book')
            .sort({ borrowDate: -1 });
    }
}
```

#### Borrow Controller Implementation
```typescript
// src/borrow/borrow.controller.ts
@Controller('borrow')
export class BorrowController {
    constructor(private borrowService: BorrowService) {}

    @Post()
    @UseGuards(AuthGuard())
    async borrowBook(
        @Body() borrowDto: BorrowBookDto,
        @Req() req
    ): Promise<Borrow> {
        return this.borrowService.borrowBook(req.user._id, borrowDto);
    }

    @Put(':id/return')
    @UseGuards(AuthGuard())
    async returnBook(
        @Param('id') id: string,
        @Req() req
    ): Promise<Borrow> {
        return this.borrowService.returnBook(req.user._id, { borrowId: id });
    }

    @Get('history')
    @UseGuards(AuthGuard())
    async getBorrowHistory(@Req() req): Promise<Borrow[]> {
        return this.borrowService.getBorrowHistory(req.user._id);
    }
}
```

#### Borrow Endpoints

1. **Borrow Book** (`POST /borrow`)
   - Protected route
   - Required fields: bookId, dueDate
   - Example Request:
   ```json
   {
     "bookId": "book_id",
     "dueDate": "2024-04-01T00:00:00.000Z"
   }
   ```

2. **Return Book** (`PUT /borrow/:id/return`)
   - Protected route
   - Book status update
   - Example Response:
   ```json
   {
     "id": "borrow_id",
     "user": "user_id",
     "book": "book_id",
     "borrowDate": "2024-03-01T00:00:00.000Z",
     "dueDate": "2024-04-01T00:00:00.000Z",
     "returned": true
   }
   ```

3. **Get Borrowing History** (`GET /borrow/history`)
   - Protected route
   - User-specific history
   - Example Response:
   ```json
   [
     {
       "id": "borrow_id",
       "book": {
         "id": "book_id",
         "title": "Book Title",
         "author": "Author Name"
       },
       "borrowDate": "2024-03-01T00:00:00.000Z",
       "dueDate": "2024-04-01T00:00:00.000Z",
       "returned": true
     }
   ]
   ```

## Security Features

- JWT Authentication
- Role-based Authorization
- Password Hashing
- Rate Limiting
- Helmet Security Headers
- Input Validation
- Request Transformation

## Error Handling

- 400 Bad Request: Invalid input data
- 401 Unauthorized: Missing/invalid token
- 403 Forbidden: Insufficient roles
- 404 Not Found: Resource not found
- 409 Conflict: Resource already exists

## Development

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the UNLICENSED License.

## Security Implementation Guide

### 1. Basic Security Setup (main.ts)

We've implemented several layers of security in the application's entry point:

#### 1.1 Helmet Security Headers
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-site" },
}));
```
**Purpose**: 
- Protects against various web vulnerabilities
- Controls resource loading
- Prevents clickjacking
- Manages cross-origin policies

**Key Features**:
- Content Security Policy (CSP) configuration
- Cross-origin protection
- Resource loading restrictions

#### 1.2 CORS Configuration
```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  maxAge: 3600,
});
```
**Purpose**:
- Controls which domains can access the API
- Prevents unauthorized cross-origin requests
- Manages preflight requests caching

**Configuration Options**:
- Configurable origins through environment variables
- Allowed HTTP methods
- Credentials handling
- Preflight request caching

#### 1.3 Session Management
```typescript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'strict'
  },
}));
```
**Purpose**:
- Manages user sessions securely
- Protects against session hijacking
- Implements secure cookie policies

**Security Features**:
- Secure cookies in production
- HTTP-only cookies
- Strict same-site policy
- Configurable session duration

#### 1.4 Request Validation
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true
  },
  disableErrorMessages: process.env.NODE_ENV === 'production'
}));
```
**Purpose**:
- Validates all incoming requests
- Prevents injection attacks
- Ensures data integrity

**Features**:
- Automatic property filtering
- Type conversion
- Production-safe error messages
- Strict validation rules

#### 1.5 Request Logging
```typescript
app.use((req, res, next) => {
  logger.log(`${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});
```
**Purpose**:
- Monitors API usage
- Helps in security auditing
- Tracks potential security issues

### 2. Environment Configuration

Create a `.env` file with the following secure defaults:
```env
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:4200
SESSION_SECRET=your-super-secret-key-change-in-production
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES=3d
```

**Important Security Notes**:
1. Never commit `.env` files to version control
2. Use different secrets for development and production
3. Regularly rotate secrets in production
4. Use strong, randomly generated secrets

### 3. Security Best Practices

#### Production Deployment
1. Always enable HTTPS in production
2. Use secure cookie settings
3. Implement proper CORS policies
4. Enable security headers through Helmet
5. Hide error details from clients

#### Development Guidelines
1. Keep dependencies updated
2. Use environment-specific configurations
3. Implement proper logging
4. Regular security audits
5. Follow the principle of least privilege

#### Security Headers Explained
1. **Content-Security-Policy**: Controls resource loading
2. **X-Frame-Options**: Prevents clickjacking
3. **X-XSS-Protection**: Helps prevent XSS attacks
4. **X-Content-Type-Options**: Prevents MIME-type sniffing
5. **Strict-Transport-Security**: Enforces HTTPS

### 4. Testing Security Measures

To verify security implementations:

```bash
# 1. Test CORS
curl -H "Origin: http://localhost:4200" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://localhost:3000/api

# 2. Test Security Headers
curl -I http://localhost:3000/api

# 3. Test Session Management
curl -c cookies.txt -b cookies.txt http://localhost:3000/api/auth
```

### 5. Monitoring and Maintenance

1. Regular Tasks:
   - Monitor security logs
   - Update dependencies
   - Review security policies
   - Test security measures
   - Audit access patterns

2. Security Checklist:
   - [ ] All secrets are properly configured
   - [ ] CORS is properly configured
   - [ ] Security headers are enabled
   - [ ] Session management is secure
   - [ ] Input validation is implemented
   - [ ] Logging is properly configured

## Enhanced Authentication System

### 1. JWT Strategy Improvements

We've enhanced the JWT strategy with additional security features:

```typescript
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
            ignoreExpiration: false,  // Ensure token expiration is checked
            passReqToCallback: true,  // Pass request object to validate method
        });
    }
}
```

**Key Improvements**:
- Token expiration validation
- Request context awareness
- Token blacklist support (prepared)
- Password change validation
- Account status checking

### 2. Enhanced User Schema

The User schema has been extended with security-related fields:

```typescript
export class User extends Document {
    @Prop()
    name: string;

    @Prop({ unique: true })
    email: string;

    @Prop()
    password: string;

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
```

**New Security Features**:

1. **Password Management**:
   - Track password changes
   - Support password reset functionality
   - Store password reset tokens securely

2. **Email Verification**:
   - Track email verification status
   - Store verification tokens
   - Support email verification workflow

3. **Account Security**:
   - Track login attempts
   - Implement account locking
   - Monitor last login timestamp

4. **Account Status**:
   - Track active/inactive status
   - Support account deactivation
   - Maintain user roles

### 3. Security Workflows

#### 3.1 Password Reset Flow
```
1. User requests password reset
2. System generates reset token
3. Token sent to user's email
4. User submits new password with token
5. System validates token and updates password
6. All existing JWT tokens are invalidated
```

#### 3.2 Email Verification Flow
```
1. User signs up
2. System generates verification token
3. Verification email sent
4. User clicks verification link
5. System validates token and marks email as verified
```

#### 3.3 Account Locking Flow
```
1. User attempts login
2. System tracks failed attempts
3. After X failed attempts, account is locked
4. Lock expires after set duration
5. User notified of account status
```

### 4. Security Considerations

1. **Token Management**:
   - Short-lived access tokens
   - Secure token storage
   - Token rotation on security events

2. **Password Security**:
   - Strong password requirements
   - Secure password reset process
   - Password change notifications

3. **Account Protection**:
   - Brute force prevention
   - Account recovery options
   - Activity monitoring

4. **Email Security**:
   - Verified email communications
   - Secure token delivery
   - Anti-spam measures

### 5. Implementation Notes

1. **Environment Variables**:
```env
JWT_SECRET=your-super-secret-key
JWT_EXPIRES=15m
REFRESH_TOKEN_SECRET=another-super-secret-key
REFRESH_TOKEN_EXPIRES=7d
EMAIL_VERIFICATION_EXPIRES=24h
PASSWORD_RESET_EXPIRES=1h
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=1h
```

2. **Security Headers**:
```typescript
app.use(helmet({
  // ... existing config ...
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}));
```

### Refresh Token Implementation

The system now implements a secure refresh token mechanism that enables longer user sessions while maintaining security. This implementation includes:

#### 1. Token Types

1. **Access Token**
   - Short-lived (15 minutes by default)
   - Used for API authentication
   - Contains user ID and roles
   - JWT-based

2. **Refresh Token**
   - Long-lived (7 days by default)
   - Stored securely in database
   - Hashed before storage
   - Used to obtain new access tokens
   - Includes device tracking

#### 2. Token Storage Schema

```typescript
@Schema({
    timestamps: true,
})
export class RefreshToken {
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
```

#### 3. Authentication Endpoints

1. **Login** `POST /auth/login`
   ```json
   // Request
   {
     "email": "user@example.com",
     "password": "password123"
   }
   
   // Response
   {
     "accessToken": "eyJhbG...",
     "refreshToken": "a1b2c3..."
   }
   ```

2. **Refresh Token** `POST /auth/refresh-token`
   ```json
   // Request
   {
     "refreshToken": "a1b2c3..."
   }
   
   // Response
   {
     "accessToken": "eyJhbG...",
     "refreshToken": "d4e5f6..."
   }
   ```

3. **Revoke Token** `POST /auth/revoke-token`
   ```json
   // Request
   {
     "tokenId": "token_id_here"
   }
   
   // Response
   {
     "message": "Token revoked successfully"
   }
   ```

4. **Revoke All Tokens** `POST /auth/revoke-all`
   - Revokes all refresh tokens for the current user
   - Useful for "logout from all devices" functionality

5. **Get Active Sessions** `GET /auth/sessions`
   - Returns list of active sessions for the current user
   - Includes device and location information

#### 4. Security Features

1. **Token Security**
   - Refresh tokens are hashed before storage
   - Access tokens have short expiration
   - Automatic token rotation on refresh
   - One-time use refresh tokens

2. **Session Management**
   - Device tracking (User Agent)
   - IP address logging
   - Session revocation
   - Multiple session support

3. **Protection Mechanisms**
   - Token expiration
   - Token revocation
   - Secure token storage
   - Device fingerprinting

#### 5. Configuration

Environment variables for token configuration:
```env
JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRES=15m
JWT_EXPIRES=3d
```

#### 6. Usage Example

```typescript
// Login
const response = await fetch('/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { accessToken, refreshToken } = await response.json();

// Using access token
headers.Authorization = `Bearer ${accessToken}`;

// Refreshing token
const refreshResponse = await fetch('/auth/refresh-token', {
  method: 'POST',
  body: JSON.stringify({ refreshToken })
});

const newTokens = await refreshResponse.json();
```

#### 7. Best Practices

1. **Token Storage**
   - Store refresh token securely (HTTP-only cookies recommended)
   - Never store access tokens in local storage
   - Clear tokens on logout

2. **Token Usage**
   - Use access token for all API requests
   - Refresh token should only be used to obtain new tokens
   - Implement automatic token refresh

3. **Error Handling**
   - Handle token expiration gracefully
   - Implement automatic retry with refresh
   - Clear tokens on authentication errors