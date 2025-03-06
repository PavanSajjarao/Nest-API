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

#### Book Endpoints

1. **Get All Books** (`GET /books`)
   - Pagination support
   - Search functionality
   - Protected route

2. **Create Book** (`POST /books`)
   - Protected route (Moderator/Admin only)
   - Required fields validation

3. **Get Book by ID** (`GET /books/:id`)
   - Protected route
   - ID validation

4. **Update Book** (`PUT /books/:id`)
   - Protected route (Moderator/Admin only)
   - Partial updates supported

5. **Delete Book** (`DELETE /books/:id`)
   - Protected route
   - Soft delete functionality

### 3. Borrowing Module

#### Endpoints

1. **Borrow Book** (`POST /borrow`)
   - Protected route
   - Required fields: bookId, dueDate

2. **Return Book** (`PUT /borrow/:id/return`)
   - Protected route
   - Book status update

3. **Get Borrowing History** (`GET /borrow/history`)
   - Protected route
   - User-specific history

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