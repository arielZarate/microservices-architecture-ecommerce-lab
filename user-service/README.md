# User Service

Microservicio de autenticación y gestión de usuarios para el e-commerce.

## Descripción

Este servicio gestiona el registro y login de usuarios:
- Registro de usuarios con hash de contraseña (bcrypt)
- Login con generación de JWT (HS512, 7 días de expiración)
- Persistencia en PostgreSQL con Prisma ORM
- Generación de tokens JWT compatibles con el resto de microservicios del ecosistema

## Tech Stack

- **Node.js** + **Express** + **TypeScript**
- **Prisma** ORM (acceso a datos)
- **PostgreSQL** (base de datos)
- **bcryptjs** (hashing de contraseñas)
- **jsonwebtoken** (generación y validación de JWT)
- **Winston** (logging)
- **Swagger** (documentación OpenAPI)

## Arquitectura

### Clean Architecture

```
Controller (DTO) → Service (interfaz/impl) → Repository → Prisma → DB
                      ↓
                Domain/Entity (User)
```

### Estructura de Capas

```
Routes → Controller (clase, recibe interfaz por constructor)
              ↓
        Service Interface (UserService)
              ↓
        Service Impl (UserServiceImpl)
              ↓
        Repository Interface (UserRepository)
              ↓
        Repository Impl (UserRepositoryImpl)
              ↓
        Prisma → PostgreSQL
```

### Inyección de Dependencias

```typescript
// auth.route.ts
const userRepository: UserRepository = new UserRepositoryImpl();
const userService: UserService = new UserServiceImpl(userRepository);
const authController = new AuthController(userService);
```

- **Controller** recibe `UserService` (interfaz)
- **Router** crea `UserServiceImpl` y `UserRepositoryImpl` y las pasa
- Tipado con interfaz para mantener el desacoplamiento

## Estructura del proyecto

```
user-service/
├── prisma/
│   └── schema.prisma             # Modelo User
├── generated/                    # Prisma client
├── src/
│   ├── app.ts                    # Configuración Express
│   ├── server.ts                 # Entry point
│   ├── config/
│   │   ├── logger.ts             # Winston logger
│   │   └── swagger.ts            # Configuración Swagger OpenAPI
│   ├── lib/
│   │   └── prisma.ts            # Prisma client singleton
│   ├── models/
│   │   ├── user.model.ts        # Clase User
│   │   └── enum/
│   │       └── userRole.ts      # Enum de roles
│   ├── services/
│   │   ├── user.service.interface.ts  # Interfaz
│   │   └── user.service.impl.ts       # Implementación
│   ├── controllers/
│   │   ├── auth.controller.ts   # Clase controladora
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   └── auth.response.dto.ts
│   │   └── mappers/
│   │       └── auth.mapper.ts   # DTO ↔ Domain
│   ├── persistence/
│   │   ├── user.repository.interface.ts
│   │   ├── user.repository.impl.ts
│   │   ├── model/
│   │   │   └── user.prisma.ts   # Type Prisma
│   │   ├── dto/
│   │   │   └── user.prisma.dto.ts
│   │   └── mappers/
│   │       └── user.mapper.ts   # Prisma ↔ Domain
│   ├── routes/
│   │   ├── index.route.ts       # Agrupador de rutas
│   │   ├── auth.route.ts        # Rutas de auth
│   │   ├── api.route.ts         # Ruta raíz del microservicio
│   │   └── health.route.ts      # Health check
│   └── middlewares/
│       └── errorHandler.ts      # HttpError + errorHandler global
├── .env
├── tsconfig.json
├── package.json
└── README.md
```

## Modelo (Clase)

### User

```typescript
class User {
  private id?: number;
  private name: string;
  private email: string;
  private password: string;
  private role: UserRole;

  constructor(id, name, email, password, role);
  
  // Getters y Setters para cada campo
  getId(): number;
  setId(value: number): void;
  getName(): string;
  setName(value: string): void;
  getEmail(): string;
  setEmail(value: string): void;
  getPassword(): string;
  setPassword(value: string): void;
  getRole(): UserRole;
  setRole(value: UserRole): void;
  
  toString(): string;
}
```

### UserRole (Enum)

```typescript
enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}
```

## Interfaz del Service

```typescript
interface UserService {
  register(name: string, email: string, password: string): Promise<AuthResponse>;
  login(email: string, password: string): Promise<AuthResponse>;
}
```

## DTOs

### RegisterDTO

```typescript
interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}
```

### LoginDTO

```typescript
interface LoginDTO {
  email: string;
  password: string;
}
```

### AuthResponseDTO

```typescript
interface AuthResponseDTO {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}
```

## Flujo de autenticación

### Registro

```
POST /api/auth/register { name, email, password }
               ↓
        Validar campos requeridos
               ↓
        Verificar email no existente
               ↓
        bcrypt.hash(password, saltRounds)
               ↓
        Crear User en DB (role: USER por defecto)
               ↓
        jwt.sign({ id, name, email, role }, JWT_SECRET, { algorithm: 'HS512', expiresIn: '7d' })
               ↓
        { token, user: { id, name, email, role } }
```

### Login

```
POST /api/auth/login { email, password }
               ↓
        Buscar user por email en DB
               ↓
        Si no existe → 401
               ↓
        bcrypt.compare(password, user.password)
               ↓
        Si no coincide → 401
               ↓
        jwt.sign({ id, name, email, role }, JWT_SECRET, { algorithm: 'HS512', expiresIn: '7d' })
               ↓
        { token, user: { id, name, email, role } }
```

## JWT

### Formato del payload

```json
{
  "id": 1,
  "name": "Ariel Zarate",
  "email": "ariel@test.com",
  "role": "admin"
}
```

### Configuración

- **Algoritmo**: HS512
- **Expiración**: 7 días
- **Secret**: `JWT_SECRET` en `.env` (compartido con order-service y otros micros)

### Compatibilidad

El token generado por user-service es consumido por:
- **order-service**: middleware `token.interceptor.ts` valida el token con `jwt.verify`
- **product-service** (futuro): validación del mismo JWT
- **shipping-service** (futuro): validación del mismo JWT

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/health` | ❌ | Health check |
| GET | `/api/msv` | ❌ | Mensaje raíz del microservicio |
| POST | `/api/auth/register` | ❌ | Registrar nuevo usuario |
| POST | `/api/auth/login` | ❌ | Iniciar sesión |

## Schema Prisma

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      String   @default("USER")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
}
```

## Documentación API (Swagger)

La documentación interactiva de la API estará disponible en:

```
http://localhost:3000/api/docs
```

Incluirá:
- Endpoints de registro y login con sus parámetros y schemas
- Prueba interactiva de cada operación

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar en modo desarrollo (tsx --watch) |
| `npm run build` | Compilar TypeScript |
| `npm run start` | Iniciar producción (node dist/server.js) |

## Variables de Entorno (.env)

```
PORT=3000
DATABASE_URL="postgresql://postgres:1111@localhost:5432/users_management"
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="1111"
DB_NAME="users_management"
JWT_SECRET="sapee2026"
```

---

**Autor:** Ariel Zarate
**Email:** arieltecnico@gmail.com
