# shipment-service

Microservicio de envíos del e-commerce lab. Escrito en **Kotlin + Spring Boot 4.0.6**.

## Responsabilidad

Gestionar el ciclo de vida de los envíos desde que una orden es pagada hasta que se marca como entregada,
notificando a order-service vía Kafka en cada transición de estado.

## Relación Order ↔ Shipment

**1 orden = 1 envío.** El `id` del shipment es el **mismo `orderId`** (UUID string) que llega desde order-service.
No se usa ID autogenerado. Se setea manualmente con el UUID de la orden.

## Arquitectura (Hexagonal)

```
domain/
├── model/              → Shipment, Address, ShipmentStatus, ShipmentItem
├── ports/in/           → ShipmentService, AddressService, ShipmentStatusService, StatusStep
└── ports/out/          → ShipmentProvider, AddressProvider, ExternalAddressProvider

application/
└── services/           → ShipmentUseCase, AddressUseCase, ShipmentStatusUseCase
    └── step/           → PreparingToShippedStep, ShippedToDeliveredStep

infrastructure/
├── adapter/            → AddressAdapter, ExternalAddressAdapter, ShipmentAdapter, ShipmentStatusScheduled
├── persistence/        → ShipmentEntity, AddressEntity, ShipmentItemEntity, repositorios JPA, mapeadores
└── rest/               → AddressClient, WebClientProvider, WebConfig

interfaces/
├── rest/               → ShipmentController (endpoints REST)
├── kafka/              → OrderPaidConsumer, OrderPaidEvent
├── error/              → ErrorHandler global, excepciones, modelo RFC 7807
├── scheduler/          → ShedLockConfig
└── utils/              → CompanionLogger
```

## Comunicación actual

| Tipo | Tecnología | Hacia | Detalle |
|---|---|---|---|
| REST (client) | WebClient | shipment → user-service | Obtiene dirección del cliente (`/api/address/{customerId}`) con API Key |
| Kafka (consumer) | Spring Kafka | order-service → shipment | Consume `order-paid` para crear envío en PREPARING |
| Kafka (producer) | Spring Kafka | shipment → order-service | Produce `order-shipped` (PREPARING→SHIPPED) y `order-delivered` (SHIPPED→DELIVERED) |

## Endpoints REST

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/shipment` | Listar todos los envíos |
| `GET` | `/api/shipment/{orderId}` | Obtener envío por orderId (UUID) |

## Flujo de dirección (Address)

Cuando se necesita la dirección de un cliente para crear un envío:

```
ShipmentUseCase.createShipment(orderId, customerId)
  → AddressUseCase.getAddressByUserId(customerId)
      → ExternalAddressProvider.fetchAddressByUserId(id)
          → AddressClient.getAddressByCustomerId(id)  [HTTP → user-service]
      → AddressProvider.saveAddress(address)           [persiste en DB local]
      → retorna Address
  → Shipment(id=orderId, status=PREPARING, address=address)
  → ShipmentProvider.save(shipment)
```

La dirección se persiste localmente como tabla `address`. La relación con `shipment` es `@ManyToOne` porque un mismo cliente tiene una sola dirección que puede estar en múltiples pedidos.

## Transiciones de estado (Cron + ShedLock)

### StatusStep pattern

Cada transición de estado es un `StatusStep` independiente, anotado con `@Order`:

| Step | @Order | Origen | Destino | Kafka event | Lock name |
|---|---|---|---|---|---|
| `PreparingToShippedStep` | 1 | PREPARING | SHIPPED | `order-shipped` | `preparing-to-shipped` |
| `ShippedToDeliveredStep` | 2 | SHIPPED | DELIVERED | `order-delivered` | `shipped-to-delivered` |

### Scheduler

Dos crons independientes en `infrastructure/adapter/ShipmentStatusScheduled.kt`:

```yaml
scheduled:
  preparing-to-shipped:
    period: "0 */1 * * * *"       # cada 1 minuto
  shipped-to-delivered:
    period: "30 */2 * * * *"      # cada 2 minutos en :30
```

Cada cron tiene su propio `@SchedulerLock` con `lockAtLeastFor = "PT3M"`, lo que garantiza:

1. **Step 1** adquiere lock `preparing-to-shipped` → transiciona shipments PREPARING→SHIPPED → lock activo por 3 min
2. **Step 2** corre en schedule distinto (con offset), no puede ejecutarse hasta que el lock de step 1 haya expirado
3. Los shipments pasan ~3.5 minutos en estado SHIPPED antes de pasar a DELIVERED
4. En cada ciclo, si no hay shipments en ese estado, el step no hace nada y libera rápido

### ShedLock

- **Librería**: `net.javacrumbs.shedlock` v5.16.0
- **Provider**: `JdbcLockProvider` (JDBC directo contra PostgreSQL)
- **Tabla**: `shedlock` (creada automáticamente vía `CREATE TABLE IF NOT EXISTS` en `ShedLockConfig`)
- **Config**: `interfaces/scheduler/ShedLockConfig.kt` con `@EnableSchedulerLock(defaultLockAtMostFor = "PT30S")`

No se necesita entity JPA ni repository para ShedLock. La tabla la maneja la librería directamente con SQL.

## Flujo completo end-to-end

```
order-service                                     shipment-service
─────────────                                     ────────────────
  Marca orden como PAID
    → envía Kafka event "order-paid"
                                                   Consume "order-paid"
                                                   → crea Shipment(id=orderId, status=PREPARING)
                                                   → persiste address en DB local
                                                   
                                                   [Cada 1 min] Cron step 1:
                                                     Adquiere lock "preparing-to-shipped"
                                                     → Shipments PREPARING → SHIPPED
                                                     → Envía Kafka "order-shipped"
                                                   
                                                   [Cada 2 min en :30] Cron step 2:
                                                     Adquiere lock "shipped-to-delivered"
                                                     → Shipments SHIPPED → DELIVERED
                                                     → Envía Kafka "order-delivered"
```

## Estado actual del código

| Feature | Estado |
|---|---|
| CRUD Shipment (REST GET) | ✅ Implementado |
| Address client (WebClient → user-service con API Key) | ✅ Implementado |
| Domain model (Shipment, Address, ShipmentItem, Status) | ✅ Implementado |
| Arquitectura hexagonal | ✅ Implementada |
| Persistencia JPA (PostgreSQL) | ✅ Implementada |
| Error handling global (RFC 7807) | ✅ Implementado |
| **Kafka consumer (OrderPaid → crear shipment)** | ✅ **Funcionando** |
| Address cache local (evita duplicados por customerId) | ✅ Implementado |
| Fix: AddressMapper con id + customerId | ✅ Fix aplicado |
| Relación Shipment-Address @ManyToOne | ✅ Fix aplicado |
| **Kafka producer (order-shipped, order-delivered)** | ✅ **Funcionando** |
| **Scheduler PREPARING → SHIPPED (cron + ShedLock)** | ✅ **Funcionando** |
| **Scheduler SHIPPED → DELIVERED (cron + ShedLock)** | ✅ **Funcionando** |
| StepLock manual (eliminado, reemplazado por ShedLock) | ❌ Eliminado |
| REST PUT status a order-service | ⏳ Pendiente (consumer en order-service) |
| Topics `order-shipped` y `order-delivered` | ✅ Creados via `kafka-init` en docker-compose |

## Stack

- **Kotlin 2.2.21** + **Spring Boot 4.0.6**
- **Spring Data JPA** + PostgreSQL
- **WebClient** (REST hacia user-service)
- **Spring Kafka** (consumer + producer)
- **ShedLock 5.16.0** (cron locking distribuido con `JdbcLockProvider`)
- **springdoc OpenAPI** (Swagger UI en `/api/swagger-ui.html`)

## Docker Compose

El archivo `docker-compose.yml` incluye un servicio `kafka-init` que crea los topics `order-shipped` y `order-delivered` automáticamente al levantar el stack. Los topics se crean con `--if-not-exists` por lo que es seguro ejecutarlo múltiples veces.
