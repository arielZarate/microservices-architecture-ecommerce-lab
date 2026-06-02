# microservices-architecture-ecommerce-lab

Proyecto de laboratorio enfocado en el diseño e implementación de una **arquitectura de microservicios moderna**, aplicando:

- Arquitectura hexagonal
- Comunicación síncrona (REST) y asíncrona (Kafka)
- Autenticación con JWT + API Key interna entre micros
- Múltiples lenguajes y frameworks (Node, Java, Kotlin)

---

## Arquitectura

Cada servicio tiene su propia base de datos y están desacoplados.
La comunicación se divide en dos tipos:

| Tipo | Tecnología | Para qué |
|---|---|---|
| **Síncrona** | REST | Respuesta inmediata (validar producto, autenticar usuario, obtener dirección) |
| **Asíncrona** | Kafka (eventos) | Acciones que no necesitan respuesta inmediata (notificar a otros servicios) |

### Diagrama general

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

### Servicios

| Servicio | Lenguaje | Framework | Puerto | Comunicación |
|---|---|---|---|---|
| **user-service** | Node.js / TypeScript | Express + Prisma | 4000 | REST (auth, address) |
| **products-service** | Java 21 | Spring Boot 3.5.13 | 8080 | REST (catálogo) |
| **order-service** | Node.js / TypeScript | Express + Prisma + KafkaJS | 3000 | REST + Kafka (produce OrderPaid) |
| **shipment-service** | Kotlin | Spring Boot 4.0.6 | 8081 | Kafka (consume/produce) + REST |

---

## Comunicación interna entre micros

Toda comunicación interna (service-to-service) usa dos headers:

```
X-Middleware-ApiKey: idApp1237897key
X-Middleware-DeviceId: idDevice321567Device
```

El micro que recibe valida ambos antes de procesar la request.

---

## Flujo completo del sistema

### 1. Creación de orden
```
Usuario → POST /api/order (con JWT)
  → order-service valida productos contra products-service
  → Crea orden con status PENDING
```

### 2. Pago simulado
```
Usuario → PUT /api/order/:id/status → PAID
  → order-service publica evento "order-paid" a Kafka
```

### 3. Procesamiento de envío (shipment-service)
```
Kafka "order-paid" → shipment-service
  → AddressUseCase.getAddressByUserId(customerId)
      → GET /api/address/:customerId (REST a user-service, con API Key)
      → Guarda address en DB local
  → Crea Shipment(id=orderId, status=PREPARING, address)
```

### 4. Ciclo de entrega (shipment-service)
En un entorno real, shipment-service sería usado por un **equipo de logística/repartidores** que van actualizando el estado del envío a medida que el paquete avanza:

```
Repartidor (app mobile):
  → "Salgo a repartir" → PUT SHIPPED
  → "Entregué" → PUT DELIVERED
```

Para el laboratorio, se simula este comportamiento con un **cron cada 3 minutos**:

```
⏰ Cron cada 3 minutos en shipment-service
  → Busca shipments en PREPARING
      → Cambia a SHIPPED
      → Publica "order-shipped" (Kafka)
  → Busca shipments en SHIPPED (con tiempo suficiente)
      → Cambia a DELIVERED
      → Publica "order-delivered" (Kafka)
```

Se mantiene la opción de endpoints manuales para debug.

### 5. Actualización de orden (vía Kafka)
```
shipment-service publica "order-shipped" / "order-delivered"
     ↓
order-service consume (por capa de servicio, sin REST)
     ↓
orderService.updateStatus(id, SHIPPED/DELIVERED)
     ↓
Cliente ve el cambio en la orden
```

> **Nota sobre comunicación**:
> - **order ↔ shipment**: solo Kafka (eventos asíncronos)
> - **order ↔ products**: solo REST (síncrono, validación inmediata de productos)
> - **shipment ↔ user**: solo REST (síncrono, obtener dirección con API Key interna)

### Diagrama de secuencia completo
```
order-service                  shipment-service               user-service
     │                              │                              │
     │  PUT /status → PAID          │                              │
     │  publica "order-paid"        │                              │
     │ ──────────────────────────►  │                              │
     │                              │  GET /address/:customerId    │
     │                              │ ──────────────────────────►  │
     │                              │ ◄──────────────────────────  │
     │                              │                              │
     │                              │  Crea Shipment PREPARING     │
     │                              │                              │
     │                              │  ⏰ Cron 3min                │
     │                              │  PREPARING → SHIPPED         │
     │                              │                              │
     │  publica "order-shipped"     │                              │
     │ ◄──────────────────────────  │                              │
     │                              │                              │
     │  Actualiza orden → SHIPPED   │                              │
     │                              │                              │
     │                              │  ⏰ Cron (siguiente)         │
     │                              │  SHIPPED → DELIVERED         │
     │                              │                              │
     │  publica "order-delivered"   │                              │
     │ ◄──────────────────────────  │                              │
     │                              │                              │
     │  Actualiza orden → DELIVERED │                              │
```

---

## Eventos del sistema

| Evento | Topic | Producer | Consumer | Estado |
|---|---|---|---|---|
| `OrderPaid` | `order-paid` | order-service | shipment-service | ✅ Producer OK / Consumer ⏳ |
| `OrderShipped` | `order-shipped` | shipment-service | order-service | ⏳ Pendiente |
| `OrderDelivered` | `order-delivered` | shipment-service | order-service | ⏳ Pendiente |

---

## Autenticación

### JWT (para usuarios)
```
POST /api/auth/login → { token }
→ Cada request lleva: Authorization: Bearer <token>
→ user-service genera, el resto valida localmente con JWT_SECRET compartido
```

### API Key (para comunicación interna entre micros)
```
X-Middleware-ApiKey: idApp1237897key
X-Middleware-DeviceId: idDevice321567Device
→ Se valida en cada endpoint interno (ej: GET /api/address/:customerId)
```

---

## Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Lenguajes | Java 21, Kotlin 2.2.21, TypeScript |
| Frameworks | Spring Boot 4.0.6 / 3.5.13, Express |
| ORM | Spring Data JPA, Prisma |
| Mensajería | Apache Kafka 4.3.0 (KRaft) |
| BB.DD. | PostgreSQL (una por servicio) |
| Infraestructura | Docker, Docker Compose |
| Documentación | springdoc OpenAPI, Swagger |

---

## Estructura del proyecto

```
microservices-architecture-ecommerce-lab/
│
├── user-service/              # Node/Express + TypeScript + Prisma
├── products-service/          # Java 21 + Spring Boot / Hexagonal
├── order-service/             # Node/Express + TypeScript + Prisma + KafkaJS
├── shipment-service/          # Kotlin + Spring Boot 4.0.6 + Kafka
├── docker-compose.yml         # Kafka en modo KRaft
└── README.md
```

Cada servicio tiene su propio README con detalles de implementación, endpoints y configuración.

---

## Plan de despliegue: K8s + ArgoCD (GitOps)

### Arquitectura objetivo

```
GitHub (manifests YAML)
        ↓
      ArgoCD
        ↓
k3d Kubernetes cluster
        ↓
     Ingress
        ↓
API Gateway (Spring Cloud Gateway)
        ↓
  Microservicios:
  - user-service (Node)
  - order-service (Node)
  - products-service (Java)
  - shipment-service (Kotlin)
        ↓
  Kafka (KRaft) + PostgreSQL (una por servicio)
```

### Regla de oro

| Componente | Rol |
|---|---|
| **Kubernetes (k3d)** | Runtime — dónde corren los servicios |
| **ArgoCD** | Despliegue automático — GitOps |
| **CI (GitHub Actions / Jenkins)** | Build + test + Docker push (no toca deploy) |

No se mezclan responsabilidades.

---

### Fases

#### 🥇 FASE 1 — Kubernetes base (k3d)
- [ ] Levantar cluster k3d
- [ ] Deploy manual de todos los servicios (YAMLs)
- [ ] Services, Ingress, ConfigMaps, Secrets
- [ ] Objetivo: sistema funcionando SIN automatización

#### 🥈 FASE 2 — Infra interna en K8s
- [ ] Kafka en Kubernetes
- [ ] PostgreSQL (un pod por servicio)
- [ ] Networking interno entre pods

#### 🥉 FASE 3 — API Gateway
- [ ] Spring Cloud Gateway como punto de entrada único
- [ ] Routing hacia cada microservicio
- [ ] Validación JWT centralizada
- [ ] Headers comunes (API Key interna)
- [ ] Control de tráfico

#### 🧩 FASE 4 — Estabilización del cluster
- [ ] Health checks
- [ ] Readiness / Liveness probes
- [ ] Config centralizada por environment

#### 🥇 FASE 5 — ArgoCD (GitOps)
- [ ] Instalar ArgoCD en el cluster
- [ ] Conectar con repositorio Git de manifests
- [ ] `git push` → ArgoCD detecta → cluster se actualiza solo

#### 🥈 FASE 6 — CI (opcional)
- [ ] GitHub Actions o Jenkins
- [ ] Build + test + Docker push
- [ ] No toca deploy (eso lo hace ArgoCD)

---

## Estado del proyecto

### Aplicación (microservicios)

| Feature | Estado |
|---|---|
| Registro y login con JWT | ✅ |
| CRUD de productos (FakeStore + DB) | ✅ |
| Órdenes de compra con estados | ✅ |
| Productor Kafka (OrderPaid) | ✅ |
| Address client (shipment → user-service) | ✅ |
| API Key interna entre micros | ✅ |
| Arquitectura hexagonal (shipment) | ✅ |
| Address (persistencia local en shipment) | ✅ |
| Shipment.id tipo UUID (misma orden) | ✅ |
| Consumer Kafka (crear shipment) | ⏳ Pendiente |
| Cron scheduler (PREPARING → SHIPPED → DELIVERED) | ⏳ Pendiente |
| Productor Kafka (OrderShipped / OrderDelivered) | ⏳ Pendiente |
| Consumer en order-service (actualizar estado) | ⏳ Pendiente |
| API Key en products-service (order → products) | 📝 Planificado |

### Infraestructura (K8s + ArgoCD)

| Fase | Estado |
|---|---|
| FASE 1 — Kubernetes base (k3d) | ⏳ Pendiente |
| FASE 2 — Infra interna (Kafka + DBs) | ⏳ Pendiente |
| FASE 3 — API Gateway | ⏳ Pendiente |
| FASE 4 — Estabilización del cluster | ⏳ Pendiente |
| FASE 5 — ArgoCD (GitOps) | ⏳ Pendiente |
| FASE 6 — CI (opcional) | ⏳ Pendiente |

---

## Comandos (desarrollo local)

```bash
# Iniciar Kafka
docker compose up -d

# Order service
cd order-service && npm run dev

# User service
cd user-service && npm run dev

# Shipment service
cd shipment-service && ./mvnw spring-boot:run

# Products service
cd products-service && ./mvnw spring-boot:run
```

---

## Objetivo

Este proyecto no busca solo funcionar, sino demostrar diseño de sistemas reales con:

- Comunicación síncrona (REST) y asíncrona (Kafka)
- Múltiples lenguajes y frameworks (Java, Kotlin, Node, TypeScript)
- Arquitectura hexagonal en microservicios
- API Key interna para comunicación service-to-service
- Despliegue automatizado con GitOps (K8s + ArgoCD)
- Separación clara entre aplicación, infraestructura y automatización
