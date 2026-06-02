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
| REST (client) | WebClient | shipment → user-service | Obtiene dirección del cliente (`/api/address/{customerId}`) |
| Kafka (consumer) | ⏳ Pendiente | order-service → shipment | Escuchará `OrderPaid` para iniciar envío |
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

La dirección se persiste localmente como tabla `address` con relación `@OneToOne` al shipment.

## Estado actual del código

| Feature | Estado |
|---|---|
| CRUD Shipment (REST GET) | ✅ Implementado |
| Address client (WebClient → user-service) | ✅ Implementado |
| Domain model (Shipment, Address, Status) | ✅ Implementado |
| Arquitectura hexagonal | ✅ Implementada |
| Persistencia JPA (PostgreSQL) | ✅ Implementada |
| Error handling global (RFC 7807) | ✅ Implementado |
| Kafka consumer (OrderPaid → crear shipment) | ⏳ Pendiente |
| Kafka producer (OrderShipped) | ⏳ Pendiente |
| Scheduler (PREPARING → SHIPPED automático) | ⏳ Pendiente |
| REST PUT status a order-service | ⏳ Pendiente |

## Stack

- **Kotlin 2.2.21** + **Spring Boot 4.0.6**
- **Spring Data JPA** + PostgreSQL
- **WebClient** (REST hacia user-service)
- **Spring Kafka** (dependencia incluida, consumer pendiente)
- **springdoc OpenAPI** (Swagger UI en `/api/swagger-ui.html`)
