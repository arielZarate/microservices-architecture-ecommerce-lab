# User Service

Microservicio de autenticación, gestión de usuarios y consulta de direcciones para el e-commerce.

## Descripción

Este servicio gestiona:
- Registro de usuarios con hash de contraseña (bcrypt)
- Login con generación de JWT
- Reset de contraseña
- Consulta interna de dirección por customerId (para shipment-service y otros microservicios)
- Persistencia en PostgreSQL con Prisma ORM

## Tech Stack

- **Node.js** + **Express** + **TypeScript**
- **Prisma** ORM (acceso a datos)
- **PostgreSQL** (base de datos)
- **bcryptjs** (hashing de contraseñas)
- **jsonwebtoken** (generación y validación de JWT)
- **Vitest** (tests unitarios)

## Arquitectura

### Clean Architecture / Capas

```
Routes → Controller (clase, recibe interfaz por constructor)
              ↓
        Service Interface
              ↓
        Service Impl (validación + lógica de negocio)
              ↓
        Repository Interface
              ↓
        Repository Impl (Prisma queries)
              ↓
        Prisma → PostgreSQL
```

### Inyección de Dependencias

```typescript
// address.route.ts
const userRepository = new UserRepositoryImpl();
const addressService: AddressService = new AddressServiceImpl(userRepository);
const addressController = new AddressController(addressService);
```

- **Controller** recibe la interfaz del servicio por constructor
- **Route** instancia las implementaciones concretas y las inyecta
- Tipado con interfaz para mantener desacoplamiento

## Estructura del proyecto

```
user-service/
├── prisma/
│   ├── schema.prisma                 # Modelo User (con campos de dirección)
│   └── migrations/                   # Migraciones de base de datos
├── generated/prisma/                 # Prisma client generado
├── src/
│   ├── app.ts                        # Configuración Express
│   ├── server.ts                     # Entry point (conexión DB + listen)
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   └── jwt.ts                    # Generación de JWT
│   ├── models/
│   │   ├── user.model.ts             # Clase User (domain)
│   │   └── enum/
│   │       └── userRole.ts           # USER | ADMIN
│   ├── services/
│   │   ├── register/                 # Registro de usuario
│   │   │   ├── register.service.interface.ts
│   │   │   └── register.service.impl.ts
│   │   ├── login/                    # Inicio de sesión
│   │   │   ├── login.service.interface.ts
│   │   │   └── login.service.impl.ts
│   │   ├── reset-password/           # Reset de contraseña
│   │   │   ├── reset.password.service.interface.ts
│   │   │   └── reset.password.service.impl.ts
│   │   └── address/                  # Consulta de dirección
│   │       ├── address.service.interface.ts
│   │       └── address.service.impl.ts
│   ├── controllers/
│   │   ├── auth.controller.ts        # register, login, resetPassword
│   │   ├── address.controller.ts     # getAddressByCustomerId
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── reset.password.dto.ts
│   │   │   ├── auth.response.dto.ts
│   │   │   ├── register.response.dto.ts
│   │   │   └── address.response.dto.ts
│   │   └── mappers/
│   │       └── auth.mapper.ts        # RegisterDTO → User domain
│   ├── persistence/
│   │   ├── user/
│   │   │   ├── user.repository.interface.ts
│   │   │   └── user.repository.impl.ts
│   │   ├── dto/
│   │   │   ├── user.prisma.dto.ts
│   │   │   └── address.prisma.dto.ts
│   │   ├── model/
│   │   │   └── user.prisma.ts
│   │   └── mappers/
│   │       └── user.mapper.ts        # Prisma → User domain
│   ├── routes/
│   │   ├── index.route.ts            # Agrupador de rutas
│   │   ├── login.route.ts
│   │   ├── register.route.ts
│   │   ├── reset.password.route.ts
│   │   ├── adddress.route.ts         # Rutas de dirección
│   │   ├── api.route.ts              # Ruta raíz del microservicio
│   │   └── health.route.ts           # Health check
│   └── middlewares/
│       └── errorHandler.ts           # HttpError + errorHandler global
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

  constructor(id, name, lastName, dni, email, password, role, active, ...optional)
  // Getters y Setters para cada campo
}
```

### UserRole (Enum)

```typescript
enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}
```

## Servicios

### RegisterService

```typescript
interface RegisterService {
  register(data: {
    name: string;
    lastName: string;
    dni: string;
    email: string;
    password: string;
    cuit?: string;
    address?: string;
    neighborhood?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    role?: string;
    phone?: string;
  }): Promise<RegisterResponseDTO>;
}
```

### LoginService

```typescript
interface LoginService {
  login(data: { email: string; password: string }): Promise<AuthResponseDTO>;
}
```

### ResetPasswordService

```typescript
interface ResetPasswordService {
  reset(email: string, newPassword: string): Promise<void>;
}
```

### AddressService

```typescript
interface AddressService {
  getAddressByCustomerId(customerId: number): Promise<AddressResponseDTO>;
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

### RegisterResponseDTO

```typescript
interface RegisterResponseDTO {
  id: number;
  name: string;
  lastName: string;
  email: string;
  role: string;
}
```

### AddressResponseDTO

```typescript
interface AddressResponseDTO {
  customerId: number;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
}
```

## Endpoints

### Públicos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/health` | ❌ | Health check |
| GET | `/api/msv` | ❌ | Mensaje raíz del microservicio |
| POST | `/api/auth/register` | ❌ | Registrar nuevo usuario |
| POST | `/api/auth/login` | ❌ | Iniciar sesión |
| POST | `/api/auth/reset-password` | ❌ | Resetear contraseña |

### Internos (entre microservicios)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/address/:customerId` | ✅ API Key (validateHeader) | Obtener dirección por ID de cliente (solo address, neighborhood, city, postalCode, country) |

> El endpoint de address es **interno** y requiere headers `X-Middleware-ApiKey` + `X-Middleware-DeviceId`.
> Usado por shipment-service para obtener la dirección al crear un envío.

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

## Consulta de dirección (solo address fields)

El repositorio usa `select` de Prisma para traer **únicamente** los campos de dirección, sin exponer el resto de datos del usuario:

```typescript
// UserRepositoryImpl
async findAddressByCustomerId(customerId: number): Promise<AddressPrismaResponse | null> {
  const found = await prisma.user.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      address: true,
      neighborhood: true,
      city: true,
      postalCode: true,
      country: true,
    },
  });
  return found;
}
```

## JWT

### Formato del payload

```json
{
  "id": 1,
  "name": "Ariel",
  "lastName": "Zarate",
  "email": "ariel@test.com",
  "role": "USER"
}
```

### Configuración

- **Algoritmo**: HS256 (por defecto en jsonwebtoken)
- **Expiración**: 24 horas
- **Secret**: `JWT_SECRET` en `.env`
- **Incluye**: `id`, `name`, `lastName`, `email`, `role`

> **Nota:** El campo `lastName` se agregó para que order-service pueda componer el `customerName` como "Ariel Zarate".

### Compatibilidad

El token generado por user-service es consumido por otros microservicios del ecosistema.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar en modo desarrollo (tsx --watch) |
| `npm run build` | Compilar TypeScript |
| `npm run start` | Iniciar producción (node dist/server.js) |
| `npm test` | Ejecutar tests unitarios (Vitest) |

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

# API Key para comunicación interna entre micros
API_KEY="idApp1237897key"
DEVICE_ID="idDevice321567Device"
```

---

**Autor:** Ariel Zarate
**Email:** arieltecnico@gmail.com
