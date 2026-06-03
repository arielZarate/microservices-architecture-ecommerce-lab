# shipment-service

Microservicio de envíos del e-commerce lab. Escrito en **Kotlin + Spring Boot 4.0.6**.

## Responsabilidad

Gestionar el ciclo de vida de los envíos desde que una orden es pagada hasta que se marca como enviada.

## Relación Order ↔ Shipment

**1 orden = 1 envío.** El `id` del shipment es el **mismo `orderId`** (UUID string) que llega desde order-service.
No se usa ID autogenerado. Se setea manualmente con el UUID de la orden.

## Arquitectura (Hexagonal)

```
domain/
├── model/              → Shipment, Address, ShipmentStatus
├── ports/in/           → ShipmentService, AddressService (interfaces de caso de uso)
└── ports/out/          → ShipmentProvider, AddressProvider, ExternalAddressProvider

application/
└── services/           → ShipmentUseCase, AddressUseCase

infrastructure/
├── adapter/            → AddressAdapter (persistencia local), ExternalAddressAdapter (cliente HTTP)
├── persistence/        → ShipmentEntity, AddressEntity, repositorios JPA, mapeadores
└── rest/               → AddressClient (WebClient hacia user-service)

interfaces/
├── rest/               → ShipmentController (endpoints REST)
├── error/              → ErrorHandler global, excepciones, modelo RFC 7807
└── utils/              → CompanionLogger
```

## Comunicación actual

| Tipo | Tecnología | Hacia | Detalle |
|---|---|---|---|
| REST (client) | WebClient | shipment → user-service | Obtiene dirección del cliente (`/api/address/{customerId}`) con API Key |
| Kafka (consumer) | Spring Kafka | order-service → shipment | Consume `OrderPaid` para iniciar envío |
| Kafka (producer) | ⏳ Pendiente | shipment → order-service | Producirá `OrderShipped` cuando el envío se complete |

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

## Estado actual del código

| Feature | Estado |
|---|---|
| CRUD Shipment (REST GET) | ✅ Implementado |
| Address client (WebClient → user-service con API Key) | ✅ Implementado |
| Domain model (Shipment, Address, Status) | ✅ Implementado |
| Arquitectura hexagonal | ✅ Implementada |
| Persistencia JPA (PostgreSQL) | ✅ Implementada |
| Error handling global (RFC 7807) | ✅ Implementado |
| **Kafka consumer (OrderPaid → crear shipment)** | ✅ **Funcionando** |
| Address cache local (evita duplicados por customerId) | ✅ Implementado |
| Fix: AddressMapper con id + customerId | ✅ Fix aplicado |
| Relación Shipment-Address @ManyToOne | ✅ Fix aplicado |
| Kafka producer (OrderShipped) | ⏳ Pendiente |
| Scheduler (PREPARING → SHIPPED automático) | ⏳ Pendiente |
| REST PUT status a order-service | ⏳ Pendiente |

## Stack

- **Kotlin 2.2.21** + **Spring Boot 4.0.6**
- **Spring Data JPA** + PostgreSQL
- **WebClient** (REST hacia user-service)
- **Spring Kafka** (consumer activo: topic `order-paid`)
- **springdoc OpenAPI** (Swagger UI en `/api/swagger-ui.html`)
