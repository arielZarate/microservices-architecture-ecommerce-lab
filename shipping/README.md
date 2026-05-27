# shipping-service

Microservicio de envíos del e-commerce lab. Escrito en **Kotlin + Spring Boot 4.0.6**.

## Responsabilidad

Gestionar el ciclo de vida de los envíos desde que una orden es pagada hasta que se marca como enviada.

## Relación Order ↔ Shipping

**1 orden = 1 envío.** El `id` del shipment es el **mismo `orderId`** que llega desde order-service.
No se usa ID autogenerado. Se setea manualmente.

## Comunicación

| Tipo | Tecnología | Hacia | Detalle |
|---|---|---|---|
| Kafka (consumer) | Kafka | order-service → shipping | Escucha `OrderPaid` para iniciar envío |
| Kafka (consumer) | Kafka | order-service → shipping | Escucha `OrderCreated` (solo log) |
| Kafka (producer) | Kafka | shipping → order-service | Produce `OrderShipped` cuando el envío se completa |
| REST (client) | WebClient | shipping → order-service | `PUT /order/:orderId/status` para actualizar estado de la orden |

## Endpoints REST

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/shipping/{orderId}` | Obtener envío por orderId |
| `GET` | `/api/shipping` | Listar todos los envíos (admin/debug) |
| `POST` | `/api/shipping` | Forzar creación manual de un envío |
| `PUT` | `/api/shipping/{orderId}/status` | Actualizar estado manualmente |

## Flujo de envío

```mermaid
sequenceDiagram
    order-service->>+shipping-service: Kafka: OrderPaid { orderId }
    shipping-service->>shipping-service: Crea Shipment(orderId, PREPARING)
    shipping-service->>order-service: REST PUT /order/{orderId}/status → PREPARING
    shipping-service->>shipping-service: Scheduler 3 min
    shipping-service->>shipping-service: Cambia estado a SHIPPED
    shipping-service->>order-service: REST PUT /order/{orderId}/status → SHIPPED
    shipping-service-->>order-service: Kafka: OrderShipped { orderId }
```

## Stack

- **Kotlin 2.2.21** + **Spring Boot 4.0.6**
- **Spring Data JPA** + PostgreSQL
- **Spring Kafka** (consumer & producer)
- **WebClient** (REST hacia order-service)
- **Scheduler** (@Scheduled o delay reactivo)
