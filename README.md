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
| **shipment-service** | Kotlin | Spring Boot 4.0.6 | 8081 | Kafka (consume desde order-paid) + REST |

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
Usuario (o sistema interno) → PUT /api/order/:id/status → PAID
  Headers: X-Middleware-ApiKey + X-Middleware-DeviceId
  → order-service valida API Key (validateHeader)
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
|---|---|---|---|---|---|
| `OrderPaid` | `order-paid` | order-service | shipment-service | ✅ Funcionando |
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
→ Se valida en endpoints internos:
  - GET /api/address/:customerId (user-service)
  - PUT /api/order/:id/status (order-service)
  - POST/PUT/DELETE /api/products/* (products-service)
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
| Consumer Kafka (crear shipment) | ✅ Funcionando |
| Address cache local (evita duplicados) | ✅ Fix: id + customerId en mapper |
| Relación Shipment-Address | ✅ Fix: @OneToOne → @ManyToOne |
| API Key en PUT /:id/status (order-service) | ✅ validateHeader |
| JWT incluye lastName | ✅ Fix en payload |
| customerName como fullname (name + lastName) | ✅ Implementado |
| JWT en products-service | ✅ Implementado |
| API Key en products-service (POST/PUT/DELETE) | ✅ JWT + API Key |
| Cron scheduler (PREPARING → SHIPPED → DELIVERED) | ⏳ Pendiente |
| Productor Kafka (OrderShipped / OrderDelivered) | ⏳ Pendiente |
| Consumer en order-service (actualizar estado) | ⏳ Pendiente |

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

---

## Análisis Arquitectónico (2026-06-04)

### ✅ Lo que está bien

**1. Poliglotismo justificado**
TypeScript para servicios con lógica de negocio liviana y mucha E/S (user, order). JVM (Kotlin/Java) para servicios con lógica pesada y concurrencia (shipment, products). La decisión es coherente.

**2. Arquitectura hexagonal real en shipment y products**
Ambos tienen separación clara `domain/ports` → `application/services` → `infrastructure/adapters` → `interfaces/rest`. Los puertos (interfaces) están bien definidos, las dependencias apuntan hacia adentro. Esto es hexagonal de verdad, no solo carpetas lindas.

**3. Database-per-service pattern**
Cada servicio tiene su propia base de datos PostgreSQL. Sin shared schemas ni acoplamiento de datos.

**4. Comunicación interna con API Key consistente**
`X-Middleware-ApiKey` + `X-Middleware-DeviceId` en todos los servicios. Mismo patrón, mismas credenciales. Simple y efectivo.

**5. Dual auth en products-service (JWT → API Key fallback)**
El `HeaderFilter` intenta JWT primero, cae a API Key si no hay token. Con GET públicos para productos. Pragmático y bien implementado.

**6. ShedLock con crons independientes**
Cada transición (PREPARING→SHIPPED, SHIPPED→DELIVERED) tiene su propio lock y su propio schedule. Los locks en DB persisten ante reinicios del servicio.

**7. Kafka event naming claro**
`order-paid`, `order-shipped`, `order-delivered`. Nombres de dominio, no técnicos. Fáciles de追踪.

---

### ❌ Lo crítico

**1. Spring Boot 4.0.6 (milestone) en shipment vs 3.5.13 en products**
Spring Boot 4.0.x todavía está en milestone (no es GA). Esto puede traer problemas de compatibilidad con librerías y bugs no resueltos. Products en 3.5.13 (stable) está bien, pero shipment en 4.0.6 es riesgoso. **Unificar las versiones o justificar por qué se necesita una milestone.**

**2. Testing: prácticamente no existe**
- `user-service`: 2 tests con Vitest ✅
- `order-service`: **cero tests** ❌
- `shipment-service`: 1 test de contexto nomás ❌
- `products-service`: 1 test de contexto nomás ❌

~5000 líneas de código y coverage casi nulo. **Esto es deuda técnica crítica** porque cualquier refactor rompe cosas sin que te enteres. Mínimo: tests unitarios de dominio y tests de integración de repositorios.

**3. Missing consumer en order-service**
Se produce `order-shipped` y `order-delivered` desde shipment, pero **order-service no los consume**. El flujo Kafka está a medio hacer. La orden nunca se entera de que su shipment cambió de estado.

**4. Sin schema registry ni contractos para Kafka**
Los eventos Kafka son `Map<String, Any>` en shipment y objetos tipados en order-service. No hay un esquema compartido (Avro/Protobuf/JSON Schema). Si se cambia la estructura del evento, **no hay forma de saber que se rompió el otro servicio** hasta que explota en runtime.

**5. Typos en nombres de archivos y packages**
- `user-service/src/routes/adddress.route.ts` (triple d)
- `user-service/src/middlewares/validaterHeader.ts` (validator ≠ validater)
- `products-service/.../infraestructure/` (infrastructure ≠ infraestructure)

Hablan de falta de code review. Si hay typos en nombres, probablemente también los haya en lógica.

**6. ddl-auto: update en producción**
Tanto shipment como products usan `hibernate.ddl-auto: update`. Aceptable en desarrollo, pero **en producción puede borrar datos** o aplicar cambios de schema inesperados. Se necesita Flyway o Liquibase para migraciones versionadas.

**7. Sin trazabilidad entre servicios**
Los logs no tienen `traceId` o `correlationId` que crucen llamadas entre servicios. Si un pedido falla, no se puede seguir el rastro user-service → order-service → shipment-service → products-service.

**8. Sin resiliencia**
- No hay circuit breakers (Resilience4j, Opossum)
- No hay retries configurables en llamadas HTTP (solo timeouts)
- Si user-service cae, shipment-service no puede crear envíos y **no hay fallback**
- Si Kafka cae, se pierden eventos (falta idempotencia/retry en productores)

**9. Sin Dockerfiles para los servicios**
El docker-compose tiene Kafka, pero los microservicios se ejecutan a pelo. Para un laboratorio de microservicios, **deberían estar containerizados**. No se puede levantar el stack completo con un solo comando.

---

### 🟡 Lo discutible

**1. Arquitectura inconsistente entre servicios**
Node.js usa **Layered** (capas), JVM usa **Hexagonal**. Los Node.js services tienen dominio anémico: `UserModel` y `OrderModel` son casi DTOs con getters, sin comportamiento real de negocio. En shipment/products el dominio sí tiene lógica. Es aceptable porque la complejidad es distinta, pero **hay que explicitarlo como decisión arquitectónica**.

**2. MapStruct vs mapeo manual**
Products usa MapStruct (genera código), shipment usa mapeo manual Kotlin. MapStruct es más verboso en setup pero más seguro. Manual es más simple pero propenso a errores (ya hubo un bug en `ShipmentMapper`).

**3. Prisma migrations vs JPA ddl-auto**
Node.js usa Prisma Migrations (versionadas, archivos SQL). JVM usa `ddl-auto: update` (automático, no versionado). Cada ecosistema trata la DB distinto. Para laboratorio está bien, pero **en producción el enfoque mixto es insostenible**.

**4. Sin API versioning**
Todo es `/api/...` sin `/api/v1/...`. Si mañana cambia la respuesta de un endpoint, se rompen todos los clientes.

**5. JWT secret hardcodeado en `.env`**
`JWT_SECRET=sapee2026superSecretKeyForJwt256bits!!` está en 3 archivos distintos. En un entorno real, esto va a un vault.

---

### 🔥 Prioridad de mejora

1. **Testear**: tests unitarios del dominio en cada servicio
2. **Terminar el consumer** en order-service para `order-shipped`/`order-delivered`
3. **Unificar versión de Spring Boot** o dejar clara la justificación
4. **Agregar correlationId** a los logs (middleware que genere UUID por request)
5. **Corregir los typos** en nombres de archivos y packages
6. **Migration strategy**: cambiar `ddl-auto: update` por Flyway en al menos un servicio
7. **Dockerizar los servicios** para poder levantar el stack completo con un solo comando

---

### Progreso actualizado

| Feature | Estado |
|---|---|
| Registro y login con JWT | ✅ |
| CRUD de productos (FakeStore + DB) | ✅ |
| Órdenes de compra con estados | ✅ |
| Productor Kafka (OrderPaid) | ✅ |
| Address client (shipment → user-service) | ✅ |
| API Key interna entre micros | ✅ |
| Arquitectura hexagonal (shipment + products) | ✅ |
| Address persistencia local en shipment | ✅ |
| Shipment.id tipo UUID (misma orden) | ✅ |
| Consumer Kafka (crear shipment) | ✅ |
| Address cache local (evita duplicados) | ✅ |
| Relación Shipment-Address @ManyToOne | ✅ |
| API Key en PUT /:id/status (order-service) | ✅ |
| JWT incluye name + lastName | ✅ |
| customerName como fullname | ✅ |
| JWT + API Key en products-service | ✅ |
| GET products/category públicos | ✅ |
| **Cron scheduler PREPARING→SHIPPED→DELIVERED** | ✅ **Funcionando con ShedLock** |
| **Productor Kafka (order-shipped / order-delivered)** | ✅ **Funcionando** |
| **ShedLock reemplaza StepLock manual** | ✅ **Implementado** |
| **Topics Kafka creados (kafka-init en compose)** | ✅ **order-shipped + order-delivered** |
| Consumer en order-service (actualizar estado) | ⏳ Pendiente |
