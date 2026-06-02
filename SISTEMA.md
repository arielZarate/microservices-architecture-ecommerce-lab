# Sistema Completo — E-commerce Microservices

## Arquitectura General

```
                    ┌──────────────────┐
                    │   user-service   │
                    │  (Node + JWT)    │
                    └────────┬─────────┘
                             │ REST (address)
                             ▼
┌──────────────┐   REST   ┌──────────────────┐   Kafka    ┌──────────────────┐
│ order-service │◄─────── │  shipment-service │◄──────────►│  (futuro)        │
│ (Node, Kafka) │         │  (Kotlin, Kafka)  │            │ notification-svc │
└───────┬───────┘         └──────────────────┘            └──────────────────┘
        │ REST
        ▼
┌──────────────────┐
│ products-service  │
│ (Java/Spring)     │
└──────────────────┘
```

**Comunicación entre micros:**
- **order ↔ products**: REST síncrono (validar productos al crear orden)
- **order ↔ shipment**: Kafka asíncrono (eventos de cambio de estado)
- **shipment ↔ user**: REST síncrono (obtener dirección del cliente)
- **Toda comunicación REST interna** lleva headers: `X-Middleware-ApiKey` + `X-Middleware-DeviceId`

---

## 1. user-service (Node + Express + Prisma)

**Puerto:** 4000

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Registrar usuario |
| POST | `/api/auth/login` | No | Login, devuelve JWT |
| POST | `/api/auth/reset-password` | No | Reset contraseña |
| GET | `/api/address/:customerId` | API Key | Dirección del usuario (uso interno) |

### Login
```
POST /api/auth/login
Body: { "email": "ariel@test.com", "password": "123456" }
Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "name": "Ariel", "lastName": "Zarate", "email": "ariel@test.com", "role": "USER" }
}
```

**JWT:** Firma HS256, secreto `sapee2026`, expira en 24h. Payload: `{ id, email, role }`.

### Register
```
POST /api/auth/register
Body: { "name": "Ariel", "lastName": "Zarate", "dni": "12345678",
        "email": "ariel@test.com", "password": "123456",
        "address": "Calle Falsa 123", "city": "Buenos Aires",
        "country": "Argentina" }
Response 201: { "id": 1, "name": "Ariel", "lastName": "Zarate", "email": "ariel@test.com", "role": "USER" }
```

### Address (uso interno entre micros)
```
GET /api/address/1
Headers: X-Middleware-ApiKey, X-Middleware-DeviceId
Response 200:
{
  "customerId": 1,
  "address": "Calle Falsa 123",
  "neighborhood": null,
  "city": "Buenos Aires",
  "postalCode": null,
  "country": "Argentina"
}
```

### Modelo User (Prisma)
```
id, name, lastName, dni, cuit?, address?, neighborhood?, city?,
postalCode?, country?, email (único), password (hash bcrypt),
phone?, role (USER|ADMIN), active, timestamps, soft delete
```

---

## 2. products-service (Java 21 + Spring Boot 3.5.13 + Hexagonal)

**Puerto:** 8080 — **Context-path:** `/api`

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Lista productos. Filtros: `?categoryId=1&search=jacket` |
| GET | `/api/products/{id}` | Producto por ID |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/{id}` | Actualizar producto |
| DELETE | `/api/products/{id}` | Soft delete |
| POST | `/api/products/{id}/activate` | Soft activate |
| GET | `/api/category` | Lista categorías. Filtro: `?name=electronics` |
| GET | `/api/category/{id}` | Categoría por ID |
| POST | `/api/category` | Crear categoría |
| PUT | `/api/category/{id}` | Actualizar categoría |
| DELETE | `/api/category/{id}` | Soft delete |

### Producto (domain)
```
productId, title, price, description, categoryId, active, imageUrl, rating (rate, count)
```

### FakeStore API
Si la DB está vacía al hacer `GET /api/products`, automáticamente:
1. Llama a `https://fakestoreapi.com/products`
2. Mapea categorías (las crea si no existen)
3. Guarda todos los productos en DB local
4. Los devuelve al cliente

### ProductResponse
```json
{
  "productId": 1,
  "title": "Fjallraven - Foldsack No. 1 Backpack",
  "price": 109.95,
  "description": "Your perfect pack for everyday use...",
  "categoryId": 1,
  "active": true,
  "imageUrl": "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
  "rating": { "rate": 3.9, "count": 120 }
}
```

### Arquitectura
Hexagonal: `domain` → `application` → `infrastructure` + `interfaces`
- `ProductAdapter` orquesta DB local + FakeStore
- MapStruct para mapeos entre entidades, domain y DTOs
- Error handling con RFC 7807

---

## 3. order-service (Node + Express + Prisma + KafkaJS)

**Puerto:** 3000

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/order` | No | Todas las órdenes. Filtro: `?status=PENDING` |
| GET | `/api/order/my` | JWT | Órdenes del usuario autenticado |
| GET | `/api/order/:id` | JWT | Orden por ID (UUID) |
| POST | `/api/order` | JWT | Crear orden |
| PUT | `/api/order/:id/status` | No | Cambiar estado |

### Crear orden (POST /api/order)
```
Headers: Authorization: Bearer <token>
Body: { "items": [{ "productId": 18, "quantity": 2 }] }
```

**Flujo interno:**
1. Extrae usuario del JWT → `{ id, name, email }`
2. Por cada item, llama a `GET http://localhost:8080/api/products/{productId}` (con JWT en header)
3. Enrichce cada item con `productName` y `unitPrice`
4. Calcula `totalAmount`
5. Guarda orden con status **PENDING**
6. Devuelve OrderResponse

### Estados de orden y transiciones válidas
```
PENDING  →  PAID  →  PREPARING  →  SHIPPED  →  (terminal)
  ↓           ↓           ↓
CANCELLED  CANCELLED   CANCELLED
```

### Simular pago (PUT /api/order/:id/status)
```
Body: { "status": "PAID" }
```

**Flujo:**
1. Valida transición: PENDING → PAID ✅
2. Actualiza DB
3. Publica evento **"order-paid"** en Kafka:
```json
{
  "eventType": "ORDER_PAID",
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "customerId": 1,
  "customerName": "Ariel Zarate",
  "customerEmail": "ariel@test.com",
  "items": [
    { "productId": 18, "productName": "Mens Cotton Jacket", "quantity": 2, "unitPrice": 55.99 }
  ]
}
```

### OrderResponse
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "totalAmount": 111.98,
  "status": "PAID",
  "items": [
    { "id": "item-uuid", "productId": 18, "productName": "Mens Cotton Jacket",
      "quantity": 2, "unitPrice": 55.99 }
  ]
}
```

### Modelo Prisma
```
Order: id (UUID), customerId, customerName, customerEmail, totalAmount (Decimal),
       status (default PENDING), timestamps, soft delete
OrderItem: id (UUID), orderId (FK), productId, productName?, quantity, unitPrice (Decimal)
```

---

## 4. shipment-service (Kotlin + Spring Boot 4.0.6 + Hexagonal)

**Puerto:** 8081 — **Context-path:** `/api`

### Endpoints actuales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/shipment` | Lista todos los envíos |
| GET | `/api/shipment/{orderId}` | Envío por orderId (UUID) |

### Estados de envío
```
PREPARING  →  SHIPPED  →  DELIVERED
```

### ShipmentResponse
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "PREPARING",
  "trackingCode": null,
  "address": {
    "address": "Calle Falsa 123",
    "neighborhood": null,
    "city": "Buenos Aires",
    "postalCode": null,
    "country": "Argentina"
  }
}
```

### Arquitectura Hexagonal
```
domain/     → Shipment, Address, ShipmentStatus, puertos (in/out)
application/ → ShipmentUseCase, AddressUseCase
infrastructure/ → adapters, persistencia JPA, clientes REST
interfaces/  → controller REST, error handler RFC 7807
```

### Cómo obtiene la dirección
```
AddressUseCase.getAddressByUserId(customerId)
  → ExternalAddressAdapter.fetchAddressByUserId(id)
    → AddressClient.getAddressByCustomerId(id)
      → GET http://localhost:4000/api/address/{customerId}
        Headers: X-Middleware-ApiKey, X-Middleware-DeviceId
      ← AddressResponse { customerId, address, neighborhood, city, postalCode, country }
    → Mapea a domain Address
  → AddressAdapter.saveAddress(address)
    → Guarda en tabla "address" (PostgreSQL)
  ← Retorna Address
```

### Modelo (JPA)
```
ShipmentEntity: id (UUID = orderId), status (enum), trackingCode,
                address (OneToOne cascade ALL), timestamps, soft delete
AddressEntity: id (autoincrement), address, neighborhood, city, postalCode, country
```

---

## Flujo Completo (Paso a Paso)

### Paso 1: Usuario se registra
```
POST http://localhost:4000/api/auth/register
Body: { name, lastName, dni, email, password, address, city, country }
→ user-service guarda usuario
→ Devuelve id, name, lastName, email, role
```

### Paso 2: Usuario hace login
```
POST http://localhost:4000/api/auth/login
Body: { email, password }
→ user-service valida credenciales
→ Devuelve JWT token + datos del usuario
```

### Paso 3: Usuario crea una orden
```
POST http://localhost:3000/api/order
Headers: Authorization: Bearer <JWT>
Body: { "items": [{ "productId": 18, "quantity": 2 }] }
```

**Lo que pasa internamente:**
```
order-service:
  1. Extrae usuario del JWT → { id: 1, name: "Ariel", email: "ariel@test.com" }
  2. Por cada item:
     GET http://localhost:8080/api/products/18
     Headers: Authorization: Bearer <JWT>
     ← products-service devuelve { title: "Mens Cotton Jacket", price: 55.99, ... }
  3. Enrichce items con productName + unitPrice
  4. Calcula total: 2 × 55.99 = 111.98
  5. Crea Order(status: PENDING) en DB
  6. Devuelve OrderResponse
```

### Paso 4: Simular pago
```
PUT http://localhost:3000/api/order/550e8400-.../status
Body: { "status": "PAID" }
```

**Lo que pasa:**
```
order-service:
  1. Valida transición PENDING → PAID ✅
  2. Actualiza order.status = PAID en DB
  3. Publica evento en Kafka topic "order-paid":
     { eventType: "ORDER_PAID", orderId, customerId, customerName, customerEmail, items }
```

### Paso 5: (Futuro) shipment-service consume evento
```
Kafka "order-paid" → shipment-service:
  1. Extrae orderId, customerId, customerName, customerEmail, items
  2. AddressUseCase.getAddressByUserId(customerId)
     → GET http://localhost:4000/api/address/1 (con API Key headers)
     → user-service devuelve dirección
     → Guarda address en DB local
  3. ShipmentUseCase.createShipment(orderId)
     → Crea Shipment(id=orderId, status=PREPARING, address)
     → Guarda en DB
  4. (Opcional) Publica evento de vuelta si necesita confirmación
```

### Paso 6: (Futuro) Cron cada 3 minutos
```
⏰ shipment-service:
  → Busca shipments en PREPARING
    → Cambia a SHIPPED
    → Publica "order-shipped" (Kafka)
  
  → Busca shipments en SHIPPED (con tiempo suficiente)
    → Cambia a DELIVERED
    → Publica "order-delivered" (Kafka)
```

### Paso 7: (Futuro) order-service consume cambios
```
Kafka "order-shipped" → order-service:
  → orderService.updateStatus(orderId, SHIPPED)
  → La orden del cliente ahora dice SHIPPED

Kafka "order-delivered" → order-service:
  → orderService.updateStatus(orderId, DELIVERED)
  → La orden del cliente ahora dice DELIVERED
```

---

## Resumen de Tecnologías

| Componente | Tecnología |
|---|---|
| user-service | Node.js + Express + TypeScript + Prisma + PostgreSQL |
| products-service | Java 21 + Spring Boot 3.5.13 + JPA + PostgreSQL + MapStruct |
| order-service | Node.js + Express + TypeScript + Prisma + KafkaJS + PostgreSQL |
| shipment-service | Kotlin + Spring Boot 4.0.6 + JPA + Kafka + WebClient + PostgreSQL |
| Mensajería | Apache Kafka 4.3.0 (KRaft, sin Zookeeper) |
| API Gateway | No implementado (los micros se llaman directo) |
| Documentación | Swagger (products y order) |

## Puertos

| Servicio | Puerto |
|---|---|
| user-service | 4000 |
| products-service | 8080 |
| order-service | 3000 |
| shipment-service | 8081 |
| Kafka | 9092 |
| PostgreSQL (user) | 5432/ users_management |
| PostgreSQL (products) | 5432/ products_management |
| PostgreSQL (order) | 5432/ order_management |
| PostgreSQL (shipment) | 5432/ shipment_management |

---

## Estado del proyecto

| Feature | Estado |
|---|---|
| Registro + Login JWT | ✅ |
| CRUD productos + FakeStore | ✅ |
| Órdenes + transición de estados | ✅ |
| Productor Kafka (OrderPaid) | ✅ |
| Address API (user → shipment) | ✅ |
| API Key interna entre micros | ✅ |
| Arquitectura hexagonal (shipment) | ✅ |
| Shipment con id UUID | ✅ |
| Consumer Kafka (crear shipment) | ⏳ Pendiente |
| Cron (PREPARING → SHIPPED → DELIVERED) | ⏳ Pendiente |
| Eventos order-shipped / order-delivered | ⏳ Pendiente |
| Consumer en order-service | ⏳ Pendiente |
| API Key en products-service | 📝 Planificado |
