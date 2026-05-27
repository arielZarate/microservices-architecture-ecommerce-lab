# Order Service

Microservicio de gestión de órdenes para el e-commerce.

## Descripción

Este servicio gestiona el ciclo de vida completo de las órdenes de compra:
- Creación de órdenes con validación de productos
- Listado y consulta de órdenes
- Actualización de estado (PENDING → PAID → PREPARING → SHIPPED → CANCELLED)
- Soft delete de órdenes
- Integración con product-service para validación de productos y precios
- Persistencia en PostgreSQL con Prisma ORM
- Autenticación JWT

## Arquitectura

### Clean Architecture

```
Controller (DTO) → Service (clase) → Repository → Prisma → DB
                    ↓
              Domain/Entity (Order)
```

### Estructura de Capas

```
Routes → Controller (clase, usa interfaz)
              ↓
        Service Interface (OrderService)
              ↓
        Service Impl (OrderServiceImpl)
              ↓
        Prisma → PostgreSQL
```

### Inyección de Dependencias

```typescript
// order.route.ts
const orderService: OrderService = new OrderServiceImpl();
const orderController = new OrderController(orderService);
```

- **Controller** recibe `OrderService` (interfaz)
- **Router** crea `OrderServiceImpl` (implementación) y la pasa
- Tipado con interfaz: `const orderService: OrderService = new OrderServiceImpl()`

## Tech Stack

- **Node.js** + **Express** + **TypeScript**
- **Prisma** ORM (acceso a datos)
- **PostgreSQL** (base de datos)
- **Axios** (comunicación HTTP con product-service)

## Estructura del proyecto

```
order-service/
├── prisma/
│   ├── schema.prisma             # Modelos Order + OrderItem
│   └── migrations/
├── generated/                    # Prisma client
├── src/
│   ├── app.ts                    # Configuración Express
│   ├── server.ts                 # Entry point
│   ├── lib/
│   │   └── prisma.ts            # Prisma client singleton
│   ├── routes/
│   │   ├── index.route.ts        # Agrupador de rutas
│   │   ├── order.route.ts       # Rutas de orders
│   │   ├── api.route.ts         # Ruta raíz del microservicio
│   │   └── health.route.ts      # Health check
│   ├── controllers/
│   │   ├── dto/
│   │   │   ├── createOrder.dto.ts
│   │   │   ├── orderResponse.dto.ts
│   │   │   └── updateOrder.dto.ts
│   │   ├── mapper/              # (vacío)
│   │   └── order.controller.ts  # Clase controladora
│   ├── services/
│   │   ├── order/
│   │   │   ├── order.service.interface.ts   # Interfaz
│   │   │   └── order.service.impl.ts       # Implementación
│   │   ├── product/
│   │   │   └── product.client.service.ts   # Cliente HTTP para product-service
│   │   └── mappers/             # (vacío)
│   ├── persistence/
│   │   ├── order/
│   │   │   ├── order.repository.interface.ts
│   │   │   └── order.repository.impl.ts
│   │   └── mappers/
│   │       └── order.mapper.ts
│   ├── models/
│   │   ├── order.model.ts       # Clase Order
│   │   ├── orderItem.model.ts   # Clase OrderItem
│   │   └── enum/
│   │       └── orderStatus.ts   # Enum de estados
│   ├── context/
│   │   └── user.context.ts        # AsyncLocalStorage para contexto global de usuario
│   ├── middlewares/
│   │   ├── token.interceptor.ts   # Middleware JWT con AsyncLocalStorage
│   │   └── errorHandler.ts
├── .env
├── tsconfig.json
├── package.json
└── README.md
```

## Modelos (Clases)

### OrderItem

```typescript
class OrderItem {
  private productId: number;
  private productName: string;
  private quantity: number;
  private unitPrice: number;

  constructor(productId, productName, quantity, unitPrice);
  
  // Getters y Setters
  getProductId(): number;
  setProductId(value: number): void;
  getProductName(): string;
  setProductName(value: string): void;
  getQuantity(): number;
  setQuantity(value: number): void;
  getUnitPrice(): number;
  setUnitPrice(value: number): void;
  
  toString(): string;
}
```

### Order

```typescript
class Order {
  private id: string;
  private customerId: number;
  private customerName: string;
  private customerEmail: string;
  private items: OrderItem[];
  private totalAmount: number;
  private status: OrderStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;

  constructor(id, customerId, customerName, customerEmail, items, totalAmount, status);
  
  // Getters y Setters para cada campo
  // ...
  
  toString(): string;
}
```

## Interfaz del Service

```typescript
interface OrderService {
  create(order: Order): Promise<Order>;
  getAll(): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
  getByCustomerId(customerId: number): Promise<Order[]>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
  delete(id: string): Promise<void>;
}
```

## Estados (OrderStatus)

```typescript
enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  CANCELLED = 'CANCELLED'
}
```

### Transiciones válidas

```
PENDING ──► PAID ──► PREPARING ──► SHIPPED
   │          │           │
   └──► CANCELLED ◄────────┘
```

| Desde       | Hacia       | Descripción                     |
|-------------|-------------|----------------------------------|
| `PENDING`   | `PAID`      | Pago confirmado                  |
| `PENDING`   | `CANCELLED` | Orden cancelada por el usuario   |
| `PAID`      | `PREPARING` | Preparación del pedido iniciada  |
| `PAID`      | `CANCELLED` | Cancelación post-pago (reembolso)|
| `PREPARING` | `SHIPPED`   | Pedido enviado                   |
| `PREPARING` | `CANCELLED` | Cancelación durante preparación  |
| `SHIPPED`   | —           | Estado terminal, no cambia       |
| `CANCELLED` | —           | Estado terminal, no cambia       |

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/health` | ❌ | Health check |
| GET | `/api/msv` | ❌ | Mensaje raíz del microservicio |
| GET | `/api/order` | ❌ | Listar todas las órdenes (`?status=PENDING`) |
| GET | `/api/order/my` | ✅ JWT | Órdenes del usuario autenticado |
| GET | `/api/order/:id` | ✅ JWT | Obtener orden por ID |
| POST | `/api/order` | ✅ JWT | Crear nueva orden |
| PUT | `/api/order/:id/status` | ❌ | Actualizar estado (uso interno entre microservicios) |

> **Nota:** `GET /api/order` acepta query param opcional `?status=PENDING|PAID|PREPARING|SHIPPED|CANCELLED` para filtrar.

## Flujo de datos para creación orden

1. **Frontend** envía JWT en header + items en body
2. **Middleware JWT** decodifica y guarda en `userContext` (AsyncLocalStorage)
3. **Controller** crea `Order` con datos del contexto + items
4. **Service** valida productos con product-service (HTTP)
5. **Service** crea orden en DB
6. **Response** al cliente

## Autenticación JWT con AsyncLocalStorage

### Flujo de autenticación

```
Frontend → Authorization: Bearer <token>
                ↓
Middleware token.interceptor.ts
                ↓
jwt.verify(token, JWT_SECRET)
                ↓
userContext.run(decoded, () => next())
                ↓
Request entra en contexto → cualquier layer puede acceder
```

### Middleware (token.interceptor.ts)

```typescript
const middleware_security = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'] as string | undefined;

  if (!authHeader) {
    return res.status(401).json({ message: 'The Token is required' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'The Token is invalid' });
  }

  try {
    const decoded = jwt.verify(token, secretKey as string) as UserDTO;
    userContext.run(decoded, () => {
      next();
    });
  } catch (err) {
    return res.status(401).json({ message: 'The Token is invalid' });
  }
};
```

### Contexto global (user.context.ts)

```typescript
import { AsyncLocalStorage } from "node:async_hooks";

const userContext = new AsyncLocalStorage<{
  id: number;
  name: string;
  email: string;
  role: string;
}>();

export default userContext;
```

### Uso del contexto

En controller, service o repository:

```typescript
import userContext from '../context/user.context.js';

const user = userContext.getStore();
// user.id, user.name, user.email, user.role
```

### Generador de token de prueba

```bash
# Generar token con node
node token_generate.js
```

El token contiene:

```json
{
  "id": 1,
  "name": "Ariel Zarate",
  "email": "ariel@test.com",
  "role": "admin"
}
```

### Beneficios de AsyncLocalStorage

- **Acceso global**: No necesitás pasar el usuario por parámetros en cada función
- **Aislamiento por request**: Cada request tiene su propio contexto
- **Compatible con async/await**: Funciona correctamente con operaciones asíncronas

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar en modo desarrollo (tsx --watch) |
| `npm run build` | Compilar TypeScript |
| `npm run start` | Iniciar producción (node dist/server.js) |

## Estado actual del desarrollo

- ✅ Setup básico (Express, TypeScript, dotenv)
- ✅ Modelos como clases (Order, OrderItem)
- ✅ Service interface + implementación
- ✅ Controller como clase con inyección
- ✅ Router con inyección de dependencias
- ✅ Schema Prisma + generación de cliente
- ✅ Repository pattern (interface + implementación con Prisma)
- ✅ Service implementation con persistencia real
- ✅ Cliente HTTP para product-service (Axios)
- ✅ JWT middleware con AsyncLocalStorage

---

**Autor:** Ariel Zarate
**Email:** arieltecnico@gmail.com