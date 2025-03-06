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

## API Documentation

### Authentication Endpoints

#### Register
- **POST** `/auth/register`
- Register a new user
- Required fields: email, password, name
- Returns: JWT token

#### Login
- **POST** `/auth/login`
- Login with email and password
- Required fields: email, password
- Returns: JWT token

### Authentication and Authorization Flow

#### 1. Role-Based Authorization System

The API implements a three-tier role system:
```typescript
export enum Role {
    User = 'user',      // Regular users
    Admin = 'admin',    // Full system access
    Moderator = 'moderator'  // Limited administrative access
}
```

#### 2. Role Guard Implementation

The `RolesGuard` works in conjunction with `AuthGuard` to provide role-based access control:

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // This line retrieves the roles we set with @Roles()
        const requireRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),  // Looks for metadata on the specific route
            context.getClass(),    // Looks for metadata on the controller class
        ]);

        // If no roles were specified with @Roles(), allow access
        if(!requireRoles) return true;

        // Get the user from the request (attached by AuthGuard)
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Check if user has any of the required roles
        return matchRoles(requireRoles, user?.role);
    }
}
```

#### 3. Complete Request Flow

When accessing a protected route with role requirements:

```
User Request → AuthGuard → JwtStrategy → RolesGuard → Route Handler
```

1. **Authentication Phase**:
   - Request hits protected route
   - `AuthGuard` intercepts request
   - Extracts JWT token from header
   - `JwtStrategy` validates token
   - User object attached to request

2. **Authorization Phase**:
   - `RolesGuard` checks route metadata
   - Gets required roles from `@Roles()` decorator
   - Compares user's roles with required roles
   - Allows/denies access based on role match

3. **Example Protected Route**:
```typescript
@Controller('books')
export class BookController {
    @Get()
    @Roles(Role.Moderator, Role.Admin, Role.User)  // Define allowed roles
    @UseGuards(AuthGuard(), RolesGuard)  // Apply both guards
    async getAllBooks() {
        return this.bookService.findAll();
    }

    @Post()
    @Roles(Role.Moderator, Role.Admin)  // Only moderators and admins
    @UseGuards(AuthGuard(), RolesGuard)
    async createBook() {
        // Create book logic
    }
}
```

#### 4. Role-Based Access Control Examples

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

#### 5. Error Handling for Authorization

- 401 Unauthorized: Invalid or missing JWT token
- 403 Forbidden: Valid token but insufficient roles
- 400 Bad Request: Invalid role assignment

#### 6. Role Assignment During Registration

When a user registers, they are assigned a default role:
```typescript
// In auth.service.ts
async signUp(signUpDto: SignUpDto) {
    const user = await this.userModel.create({
        ...signUpDto,
        role: Role.User  // Default role assignment
    });
    // ... rest of signup logic
}
```

### User Registration and Role Management

#### 1. User Registration Process

When a user registers, the following steps occur:

```typescript
// 1. User sends registration request
@Post('/signup')
signUp(@Body() signUpDto: SignUpDto): Promise<{ token: string }> {
    return this.authService.signUp(signUpDto);
}

// 2. AuthService processes registration
async signUp(signUpDto: SignUpDto) {
    // Check if user already exists
    const userExists = await this.userModel.findOne({ email: signUpDto.email });
    if (userExists) {
        throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);

    // Create new user with default role
    const user = await this.userModel.create({
        ...signUpDto,
        password: hashedPassword,
        role: Role.User  // Default role assignment
    });

    // Generate JWT token
    const token = this.jwtService.sign({ id: user._id });

    return { token };
}
```

#### 2. User Schema Definition

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

#### 3. Registration DTO

```typescript
// src/auth/dto/signUp.dto.ts
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

#### 4. Role Assignment Process

1. **Default Role Assignment**:
   - All new users are automatically assigned the `User` role
   - This is handled in the `signUp` method of `AuthService`

2. **Role Modification**:
   - Only administrators can modify user roles
   - Role changes are tracked and logged

3. **Role Validation**:
   - Roles must be one of: `User`, `Moderator`, or `Admin`
   - Invalid role assignments are rejected

#### 5. Registration Flow

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

#### 6. Example Registration Request

```json
// POST /auth/signup
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
}

// Response
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 7. Role-Based Registration Rules

1. **User Registration**:
   - Can register themselves
   - Gets default `User` role
   - Cannot specify their own role

2. **Admin Registration**:
   - Can only be created by existing admins
   - Requires special admin creation endpoint
   - Must be explicitly assigned `Admin` role

3. **Moderator Registration**:
   - Can only be created by admins
   - Must be explicitly assigned `Moderator` role

#### 8. Error Handling During Registration

- 400 Bad Request: Invalid input data
- 409 Conflict: Email already exists
- 401 Unauthorized: Invalid credentials
- 403 Forbidden: Unauthorized role assignment

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

### Authentication Module Configuration

#### 1. Auth Module Setup

The authentication module is configured with Passport and JWT:

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
  exports: [JwtStrategy, PassportModule],  // Export for use in other modules
})
export class AuthModule {}
```

#### 2. Passport Configuration

1. **Install Required Packages**:
```bash
npm install --save @nestjs/passport passport passport-jwt
npm install --save-dev @types/passport-jwt
```

2. **JWT Strategy Setup**:
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

3. **Environment Configuration**:
```env
# .env
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES=24h
```

#### 3. Authentication Flow with Passport

1. **Request Flow**:
```
Client Request → PassportModule → JwtStrategy → AuthGuard → Route Handler
```

2. **Token Extraction**:
- Passport automatically extracts JWT from Authorization header
- Format: `Authorization: Bearer <token>`

3. **Token Validation**:
- JwtStrategy validates token signature
- Checks token expiration
- Retrieves user from database

4. **User Attachment**:
- Validated user is attached to request object
- Available in route handlers via `@Req()` decorator

#### 4. Using Passport in Other Modules

1. **Import AuthModule**:
```typescript
// book.module.ts
@Module({
  imports: [
    AuthModule,  // Import to use authentication
    MongooseModule.forFeature([{ name: 'Book', schema: BookSchema }])
  ],
  // ...
})
export class BookModule {}
```

2. **Use Guards in Controllers**:
```typescript
@Controller('books')
export class BookController {
    @UseGuards(AuthGuard())  // Use Passport authentication
    @Get()
    async getAllBooks() {
        // Access authenticated user
        return this.bookService.findAll();
    }
}
```

#### 5. Passport Configuration Options

1. **JWT Strategy Options**:
```typescript
{
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    ignoreExpiration: false,  // Check token expiration
    // Additional options can be added here
}
```

2. **Token Extraction Methods**:
```typescript
// From Authorization header
ExtractJwt.fromAuthHeaderAsBearerToken()

// From query string
ExtractJwt.fromUrlQueryParameter('token')

// From cookie
ExtractJwt.fromCookie('jwt')
```