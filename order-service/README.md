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
│   └── middlewares/
│       └── errorHandler.ts
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

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/msv` | Mensaje raíz del microservicio |
| GET | `/api/order` | Listar todas las órdenes |
| GET | `/api/order/:id` | Obtener orden por ID |
| POST | `/api/order` | Crear nueva orden |
| PUT | `/api/order/:id` | Actualizar orden |
| DELETE | `/api/order/:id` | Eliminar orden (soft delete) |

## Flujo de данных para создание orden

1. **Frontend** envía JWT en header + items en body
2. **Middleware JWT** decodifica y guarda datos en `req.user`
3. **Controller** crea `Order` con datos del token + items
4. **Service** valida stock con Products (HTTP)
5. **Service** crea orden en DB
6. **Response** al cliente

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
- ⏳ **JWT middleware** (pendiente)

---

**Autor:** Ariel Zarate
**Email:** arieltecnico@gmail.com