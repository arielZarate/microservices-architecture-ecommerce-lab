# User Service

Microservicio de autenticación y gestión de usuarios para el e-commerce.

## Descripción

Este servicio gestiona registro, login y reseteo de contraseña de usuarios:
- Registro de usuarios con hash de contraseña (bcrypt)
- Login con generación de JWT
- Reseteo de contraseña por email
- Persistencia en PostgreSQL con Prisma ORM
- Validaciones de email, DNI, CUIT, contraseña

## Tech Stack

- **Node.js** + **Express** + **TypeScript**
- **Prisma** ORM (acceso a datos)
- **PostgreSQL** (base de datos)
- **bcryptjs** (hashing de contraseñas)
- **jsonwebtoken** (generación de JWT)

## Arquitectura

### Clean Architecture

```
Controller (DTO) → Service (interfaz/impl) → Repository → Prisma → DB
                      ↓
                Domain/Entity (User)
```

### Inyección de Dependencias

```typescript
const userRepository = new UserRepositoryImpl();
const registerService = new RegisterServiceImpl(userRepository);
const loginService = new LoginServiceImpl(userRepository);
const authController = new AuthController(registerService, loginService);
```

- **Controller** recibe las interfaces de servicio por constructor
- **Router** crea las implementaciones concretas y las pasa
- Tipado con interfaces para mantener el desacoplamiento

## Estructura del proyecto

```
user-service/
├── prisma/
│   ├── schema.prisma                # Modelo User
│   └── migrations/                  # Migraciones SQL
├── generated/                       # Prisma client (auto-generado)
├── src/
│   ├── app.ts                       # Configuración Express
│   ├── server.ts                    # Entry point
│   ├── lib/
│   │   ├── prisma.ts               # Prisma client singleton
│   │   └── jwt.ts                   # generateToken + TokenPayload
│   ├── models/
│   │   ├── user.model.ts           # Clase User (dominio)
│   │   └── enum/
│   │       └── userRole.ts         # Enum USER | ADMIN
│   ├── services/
│   │   ├── register/
│   │   │   ├── register.service.interface.ts
│   │   │   └── register.service.impl.ts
│   │   ├── login/
│   │   │   ├── login.service.interface.ts
│   │   │   └── login.service.impl.ts
│   │   └── reset-password/
│   │       ├── reset.password.service.interface.ts
│   │       └── reset.password.service.impl.ts
│   ├── controllers/
│   │   ├── auth.controller.ts      # register + login + resetPassword
│   │   └── dto/
│   │       ├── register.dto.ts
│   │       ├── register.response.dto.ts
│   │       ├── login.dto.ts
│   │       ├── auth.response.dto.ts
│   │       └── reset.password.dto.ts
│   ├── persistence/
│   │   ├── user.repository.interface.ts
│   │   ├── user.repository.impl.ts
│   │   ├── model/
│   │   │   └── user.prisma.ts
│   │   ├── dto/
│   │   │   └── user.prisma.dto.ts
│   │   └── mappers/
│   │       └── user.mapper.ts
│   ├── routes/
│   │   ├── index.route.ts          # Agrupador de rutas
│   │   ├── login.route.ts
│   │   ├── register.route.ts
│   │   ├── reset.password.route.ts
│   │   ├── api.route.ts
│   │   └── health.route.ts
│   └── middlewares/
│       └── errorHandler.ts         # HttpError + errorHandler global
├── .env
├── tsconfig.json
├── package.json
└── README.md
```

## Modelo de Dominio (User)

```typescript
class User {
  private id?: number;
  private name: string;
  private lastName: string;
  private dni: string;
  private cuit?: string;
  private address?: string;
  private neighborhood?: string;
  private city?: string;
  private postalCode?: string;
  private country?: string;
  private email: string;
  private password: string;
  private phone?: string;
  private active: boolean;
  private role: UserRole;
}
```

### UserRole (Enum)

```typescript
enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}
```

## DTOs

### RegisterDTO

```typescript
interface RegisterDTO {
  name: string;
  lastName: string;
  dni: string;
  email: string;
  password: string;
  role?: string;
  cuit?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}
```

### LoginDTO

```typescript
interface LoginDTO {
  email: string;
  password: string;
}
```

### ResetPasswordDTO

```typescript
interface ResetPasswordDTO {
  email: string;
  newPassword: string;
}
```

### AuthResponseDTO

```typescript
interface AuthResponseDTO {
  token: string;
  user: {
    id: number;
    name: string;
    lastName: string;
    email: string;
    role: string;
  };
}
```

## Flujos de autenticación

### Registro

```
POST /api/auth/register { name, lastName, dni, email, password, ... }
                ↓
        Validar campos requeridos
        Validar formato de email
        Validar password (≥ 6 caracteres)
        Validar DNI (7 u 8 dígitos)
        Validar CUIT si se envía (XX-XXXXXXXX-X)
                ↓
        Verificar email no existente en DB
                ↓
        bcrypt.hash(password, saltRounds)
                ↓
        Crear User en DB (role: USER, active: true)
                ↓
        { id, name, lastName, email, role }
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
        jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '24h' })
                ↓
        { token, user: { id, name, lastName, email, role } }
```

### Reset Password

```
POST /api/auth/reset-password { email, newPassword }
                ↓
        Buscar user por email en DB
                ↓
        Si no existe → 404
                ↓
        Validar password (≥ 6 caracteres)
                ↓
        bcrypt.hash(newPassword, saltRounds)
                ↓
        Actualizar password en DB
                ↓
        { message: "Password reset successfully" }
```

## JWT

### Payload (TokenPayload)

```typescript
type TokenPayload = {
  id: number;
  email: string;
  role: string;
};
```

### Configuración

- **Algoritmo**: HS256 (default de jsonwebtoken)
- **Expiración**: 24 horas
- **Secret**: `JWT_SECRET` en `.env`

### Compatibilidad

El token generado por user-service puede ser consumido por otros servicios (order-service, product-service, etc.) usando `jwt.verify(token, JWT_SECRET)`.

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/health` | ❌ | Health check |
| GET | `/api/msv` | ❌ | Mensaje raíz del microservicio |
| POST | `/api/auth/register` | ❌ | Registrar nuevo usuario |
| POST | `/api/auth/login` | ❌ | Iniciar sesión |
| POST | `/api/auth/reset-password` | ❌ | Resetear contraseña |

## validaciones (Registro)

| Campo | Regla |
|-------|-------|
| `name` | Obligatorio, mínimo 2 caracteres |
| `lastName` | Obligatorio, mínimo 2 caracteres |
| `dni` | Obligatorio, 7 u 8 dígitos |
| `email` | Obligatorio, formato `user@domain.com` |
| `password` | Obligatorio, mínimo 6 caracteres |
| `cuit` | Opcional, formato `XX-XXXXXXXX-X` |

## Schema Prisma

```prisma
model User {
  id           Int      @id @default(autoincrement())
  name         String
  lastName     String
  dni          String
  cuit         String?
  address      String?
  neighborhood String?
  city         String?
  postalCode   String?
  country      String?
  email        String   @unique
  password     String
  phone        String?
  role         String   @default("USER")
  active       Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deletedAt    DateTime?
}
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar en modo desarrollo (tsx --watch) |
| `npm run build` | Compilar TypeScript |
| `npm run start` | Iniciar producción (node dist/server.js) |

## Variables de Entorno (.env)

```
PORT=4000
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
