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
| **order-service** | Node.js / TypeScript | Express + Prisma + KafkaJS | 3000 | REST + Kafka (produce `order-paid`, consume `order-preparing`/`order-shipped`/`order-delivered`) |
| **shipment-service** | Kotlin | Spring Boot 4.0.6 | 8081 | Kafka (consume `order-paid`, produce `order-preparing`/`order-shipped`/`order-delivered`) + REST |

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

### 4. Preparación del envío (shipment-service → order-service)
Apenas se crea el shipment, shipment-service publica un evento para que order-service actualice su estado:

```
shipment-service crea Shipment(PREPARING)
  → Publica "order-preparing" (Kafka)
     ↓
order-service consume "order-preparing"
  → orderService.updateStatus(id, PREPARING)
  → Cliente ve "PREPARING" en la orden
```

### 5. Ciclo de entrega (shipment-service)
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

### 6. Actualización de orden (vía Kafka)
```
shipment-service publica "order-preparing" / "order-shipped" / "order-delivered"
     ↓
order-service consume (por capa de servicio, sin REST)
     ↓
orderService.updateStatus(id, PREPARING / SHIPPED / DELIVERED)
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
     │  PUT /status → PAID          │
     │  publica "order-paid"        │
     │ ──────────────────────────►  │
     │                              │  GET /address/:customerId    │
     │                              │ ──────────────────────────►  │
     │                              │ ◄──────────────────────────  │
     │                              │                              │
     │                              │  Crea Shipment PREPARING     │
     │                              │                              │
     │  publica "order-preparing"   │                              │
     │ ◄──────────────────────────  │                              │
     │                              │                              │
     │  Actualiza orden → PREPARING │                              │
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
|---|---|---|---|---|---|---|
| `OrderPaid` | `order-paid` | order-service | shipment-service | ✅ Funcionando |
| `OrderPreparing` | `order-preparing` | shipment-service | order-service | ✅ Funcionando |
| `OrderShipped` | `order-shipped` | shipment-service | order-service | ✅ Funcionando |
| `OrderDelivered` | `order-delivered` | shipment-service | order-service | ✅ Funcionando |

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
├── docker/
│   └── postgres/init/         # scripts de init: crean las 4 bases
├── docker-compose.yml         # PostgreSQL + microservicios + Kafka (KRaft)
└── README.md
```

Cada servicio tiene su propio README con detalles de implementación, endpoints y configuración.

---

## Infraestructura local (Docker Compose)

Estado actual del entorno containerizado del laboratorio.

### Mapa de contenedores y bases de datos

Una sola **instancia** de PostgreSQL 17 con **una base por microservicio** (database-per-service a nivel lógico).

```
CONTENEDOR postgres  (1 instancia de postgres:17)
│
├── products_management   ◄── la usa products-service
├── shipment_management   ◄── la usa shipment-service
├── orders_management     ◄── la usa order-service
└── users_management      ◄── la usa user-service

CONTENEDORES de apps (uno por microservicio)
├── products-service      → se conecta a  postgres:5432/products_management
├── shipment-service      → se conecta a  postgres:5432/shipment_management
├── order-service         → se conecta a  postgres:5432/orders_management
└── user-service          → se conecta a  postgres:5432/users_management
```

> Muchos contenedores de apps → **un** contenedor de base de datos (con una base por servicio).
> La separación física en varias instancias es una decisión de operación (escala/aislamiento), no un requisito del patrón.

### Contenedores

| Contenedor | Imagen | Puerto host | Rol | Estado |
|---|---|---|---|---|
| `postgres` | `postgres:17` | 5432 | 1 instancia con las 4 bases | ✅ |
| `products-service` | build `./products-service` | 8080 | Catálogo de productos | ✅ |
| `shipment-service` | build `./shipment-service` | 8081 | Envíos + Kafka | ⏳ sin Dockerfile |
| `order-service` | build `./order-service` | 3000 | Órdenes + Kafka | ⏳ sin Dockerfile |
| `user-service` | build `./user-service` | 4000 | Usuarios + JWT | ⏳ sin Dockerfile |
| `kafka` | `apache/kafka:4.3.0` | 9092 | Broker (KRaft) | ✅ |
| `kafka-init` | `apache/kafka:4.3.0` | — | Crea los topics | ✅ |

Cuando esté completo: **7 contenedores** (1 de DB + 4 de apps + 2 de Kafka).

### Cómo se crean las bases de datos

- La imagen oficial de Postgres ejecuta todo `.sql` de `/docker-entrypoint-initdb.d/` **solo la primera vez** (volumen vacío).
- Las 4 bases se crean en `docker/postgres/init/01-databases.sql`.
- El compose monta esa carpeta: `./docker/postgres/init:/docker-entrypoint-initdb.d:ro`.

```sql
-- docker/postgres/init/01-databases.sql
CREATE DATABASE products_management;
CREATE DATABASE shipment_management;
CREATE DATABASE orders_management;
CREATE DATABASE users_management;
```

### Cómo se conectan los servicios a la DB

Dentro de la red `ecommerce` de compose, el host de la DB es el **nombre del servicio** (`postgres`), **no** `localhost` (dentro de un contenedor, `localhost` es el contenedor mismo).

Las credenciales/URL se inyectan por variables de entorno y **sobreescriben**, por precedencia, los valores del `application.yaml` (relaxed binding):

| Variable de entorno | Propiedad de Spring | Equivalente en Node |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `spring.datasource.url` | `DATABASE_URL` |
| `SPRING_DATASOURCE_USERNAME` | `spring.datasource.username` | `DB_USER` |
| `SPRING_DATASOURCE_PASSWORD` | `spring.datasource.password` | (va en la URL) |

Ejemplo (products-service en `docker-compose.yml`):

```yaml
    depends_on:
      postgres:
        condition: service_healthy       # no arranca hasta que la DB esté lista
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/products_management
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER:-postgres}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD:-admin}
    networks: [ ecommerce ]
```

El `application.yaml` conserva los defaults de desarrollo (`localhost:5432`) para correr desde el IDE; el compose los pisa en el contenedor.

### Comandos útiles

```bash
# Levantar infra + un servicio puntual
docker compose up -d postgres products-service

# Recrear el volumen (vuelve a correr los init scripts — borra los datos)
docker compose down -v

# Verificar que existan las 4 bases
docker exec postgres psql -U postgres -tAc "SELECT datname FROM pg_database WHERE datistemplate=false;"

# Logs y health
docker compose logs products-service
curl http://localhost:8080/api/actuator/health
```

### Notas

- Los scripts de init **no se re-ejecutan** si el volumen ya tiene datos. Para aplicarlos hay que `docker compose down -v` y volver a levantar.
- Las credenciales deberían vivir en un `.env` (no versionado) + `.env.example` de plantilla.
- Las bases Node/Prisma usan password `1111` y las Spring `admin`: conviene unificarlas vía `POSTGRES_PASSWORD` al sumar los demás servicios.
- Kafka hoy anuncia `PLAINTEXT://localhost:9092`, lo que **no** funciona entre contenedores; al sumar order/shipment hay que agregar un listener interno (`kafka-container:9092`).

---

## Plan de despliegue unificado: Docker → Minikube → GitOps

> **Fuente única de verdad.** Este plan unifica y reemplaza al antiguo `PLAN.md` (ya eliminado)
> y a las fases previas de este README. 8 fases en orden progresivo + un track paralelo de tests.
> Cada fase termina con un **criterio de éxito** verificable.

### Arquitectura objetivo

```
Cliente → Minikube (Kubernetes)
            └── Ingress → API Gateway (Spring Cloud Gateway :8082)
                              ├── /api/auth/*       → user-service    (:4000)  [Node + Express + Prisma]
                              ├── /api/orders/*     → order-service   (:3000)  [Node + Express + Prisma + KafkaJS]
                              ├── /api/products/*   → products-service (:8080) [Java 21 + Spring Boot]
                              └── /api/shipments/*  → shipment-service (:8081) [Kotlin + Spring Boot]
                                        │
                                        ▼
                                 Kafka (KRaft) + PostgreSQL (una por servicio)

Git (manifests YAML) → ArgoCD → Minikube
                              ▲
       CI (GitHub Actions): build → test → docker push (no toca deploy)
```

### Regla de oro

| Componente | Rol |
|---|---|
| **Minikube (K8s)** | Runtime — dónde corren los servicios |
| **ArgoCD** | Despliegue automático — GitOps |
| **CI (GitHub Actions)** | Build + test + Docker push (no toca deploy) |

No se mezclan responsabilidades.

---

### Las 8 fases

#### 🥇 FASE 1 — Dockerfiles (4 servicios, multi-stage)

| Servicio | Lenguaje | Imagen base | Puerto runtime |
|---|---|---|---|
| `user-service` | Node.js | `node:22-alpine` | 4000 |
| `order-service` | Node.js | `node:22-alpine` | 3000 |
| `products-service` | Java 21 | `eclipse-temurin:21-jre-alpine` | 8080 |
| `shipment-service` | Kotlin | `eclipse-temurin:21-jre-alpine` | 8081 |

- [ ] Un `Dockerfile` multi-stage + `.dockerignore` por servicio

**Criterio de éxito:** las 4 imágenes buildeadas y cada una responde su endpoint de health.

---

#### 🥈 FASE 2 — Docker Compose completo (infra + servicios)

##### `docker-compose.yml` (infraestructura) — parcialmente creado
- Kafka (KRaft) — ya existe ✅
- PostgreSQL — implementación actual: **1 instancia con 4 bases** (ver [Infraestructura local](#infraestructura-local-docker-compose))
  - `postgres` → `products_management`, `shipment_management`, `orders_management`, `users_management` → host :5432
  - *Alternativa (si se necesita aislamiento): 4 instancias separadas, una por servicio.*
- `kafka-init` — crear **todos** los topics: `order-paid`, `order-preparing`, `order-shipped`, `order-delivered`

Se ejecuta solo (para desarrollo local con `npm run dev`):
```bash
docker compose up -d
```

##### `docker-compose.services.yml` (microservicios)
- [ ] Los 4 servicios con `build:` apuntando a su Dockerfile
- [ ] `depends_on` a su DB respectiva + Kafka
- [ ] Variables de entorno apuntando a **nombres de servicio** (no `localhost`)
- [ ] Puertos mapeados (4000, 3000, 8080, 8081)

Se ejecuta junto con infra:
```bash
docker compose -f docker-compose.yml -f docker-compose.services.yml up -d
```

**Criterio de éxito:** stack completo verde con un solo comando y el flujo de pedido funciona end-to-end.

---

#### 🥉 FASE 3 — Kubernetes base (Minikube)

- [ ] `minikube start --addons=ingress`
- [ ] Namespace dedicado (`lab`)
- [ ] `Deployment` + `Service` + `ConfigMap` + `Secret` + `Ingress` por cada servicio
- [ ] Imágenes cargadas en el cluster: `minikube image load <imagen>` (o desde un registry como GHCR)
- [ ] Objetivo: sistema funcionando **SIN automatización** (todo con `kubectl apply`)

**Criterio de éxito:** flujo end-to-end de un pedido pasando por el Ingress.

---

#### 🧩 FASE 4 — Infra interna en K8s (StatefulSets a mano)

- [ ] PostgreSQL: 4 × `StatefulSet` + `PersistentVolumeClaim` + headless `Service` + `Secret` de credenciales
- [ ] Migraciones al arrancar: `prisma migrate deploy` (Node) / JPA (JVM) — idealmente como `Job`
- [ ] Kafka (KRaft, 1 broker): `StatefulSet` + `Service` + `Job` init que crea los 4 topics
- [ ] Networking interno entre pods (DNS de servicios)

**Criterio de éxito:** los servicios se conectan a PostgreSQL y Kafka **dentro del cluster**, sin depender del compose del host.

---

#### 🔧 FASE 5 — Estabilización del cluster

- [ ] Readiness / Liveness / Startup probes (Node: `/health`, Spring: `actuator/health`)
- [ ] `resources.requests` y `limits` por contenedor
- [ ] Config centralizada: `ConfigMap` por ambiente + `Secret` (JWT_SECRET, API_KEY, DEVICE_ID)
- [ ] Rollouts seguros (strategy, no downtime)

**Criterio de éxito:** un pod killado se autorecupera y el rollout no corta tráfico.

---

#### 🚪 FASE 6 — API Gateway (Spring Cloud Gateway :8082)

Nuevo proyecto Java/Spring Boot en el repo: `gateway-service/`

- [ ] Punto único de entrada (puerto 8082)
- [ ] Ruteo por path: `/api/auth/*`, `/api/orders/*`, `/api/products/*`, `/api/shipments/*`
- [ ] Validación JWT de forma centralizada
- [ ] Agregar headers de API Key interna (`X-Middleware-ApiKey` + `X-Middleware-DeviceId`) automáticamente
- [ ] Rate limiting y circuit breaker (Resilience4j)
- [ ] Ingress redirige todo el tráfico al gateway

**Criterio de éxito:** todo el tráfico externo entra por el gateway; los servicios ya no se exponen directo.

---

#### 🔁 FASE 7 — GitOps: CI (GitHub Actions) + ArgoCD

> **CI antes que ArgoCD**: GitOps necesita las imágenes ya subidas al registry para que los
> manifests referenciados resuelvan.

- [ ] **CI**: GitHub Actions — Node (`npm ci` → `npm run build` → `docker build`), JVM (`./mvnw package` → `docker build`) → push a GHCR
- [ ] **CD**: instalar ArgoCD en Minikube y crear un `Application` apuntando a los manifests del repo
- [ ] Actualizar tag de imagen en los manifests → ArgoCD detecta → cluster se actualiza solo
- [ ] No hay deploy manual: `git push` → cluster actualizado

**Criterio de éxito:** un `git push` termina con el cambio desplegado en el cluster sin tocar kubectl.

---

#### 📈 FASE 8 — Observabilidad

| Herramienta | Rol |
|---|---|
| **Prometheus** | Métricas de cada servicio |
| **Grafana** | Dashboards |
| **Loki + Promtail** | Logs estructurados (JSON) |
| **OpenTelemetry + Jaeger/Tempo** | Tracing distribuido (traceId/correlationId) |

- [ ] Cada servicio exporta métricas y logs en formato JSON
- [ ] CorrelationId que cruce las llamadas entre microservicios

**Criterio de éxito:** dashboard con métricas de los 4 servicios y una traza completa de un pedido.

---

#### 🧪 Track paralelo — Tests (posterior a Fase 8)

- Unitarios de dominio: JUnit 5 (JVM), Vitest (Node)
- Tests de integración: Testcontainers (JVM), supertest + DB real (Node)
- Contract testing (opcional)

---

### Relación con cloud real (AWS / Azure)

| Local (Minikube) | Producción cloud |
|---|---|
| minikube cluster | AWS EKS / Azure AKS / Google GKE |
| Dockerfiles | Mismas imágenes, mismo build |
| docker-compose | Solo para dev local |
| `minikube image load` / GHCR | Docker push a ECR / ACR |
| Ingress (addon de Minikube) | Load Balancer (ALB / NLB) |
| Manifests YAML | Mismos manifests en Git |
| ArgoCD | ArgoCD en cluster real |

Lo que aprendas con Minikube y kubectl sirve **exactamente igual** en EKS, AKS o GKE.

---

### Notas clave

1. **Kubernetes no reemplaza API Gateway**: K8s tiene Ingress para ruteo básico, pero no valida JWT ni rate limiting nativo. El API Gateway es necesario igual.
2. **Docker Compose no es producción**: es para desarrollo local. En producción se usa K8s o similar.
3. **Database-per-service**: cada microservicio tiene su propia BD, no comparten schema.
4. **API Key interna**: toda comunicación service-to-service lleva `X-Middleware-ApiKey` + `X-Middleware-DeviceId`.
5. **JWT**: user-service genera, el resto valida con `JWT_SECRET` compartido.
6. **API Gateway centraliza**: JWT validation + API Key headers + routing en un solo lugar.

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
| Cron scheduler (PREPARING → SHIPPED → DELIVERED) | ✅ Funcionando con ShedLock |
| Productor Kafka (OrderShipped / OrderDelivered) | ✅ Funcionando |
| Consumer en order-service (order-preparing / order-shipped / order-delivered) | ✅ Funcionando |
| topic order-preparing desde ShipmentUseCase | ✅ Publicado al crear shipment |

### Infraestructura (Docker → Minikube → GitOps)

| Fase | Estado |
|---|---|
| FASE 1 — Dockerfiles (4 servicios) | 🟡 `products-service` ✅ · faltan 3 |
| FASE 2 — Docker Compose completo (infra + servicios) | 🟡 `postgres` + `products-service` ✅ · faltan 3 |
| FASE 3 — Kubernetes base (Minikube) | ⏳ Pendiente |
| FASE 4 — Infra interna en K8s (StatefulSets) | ⏳ Pendiente |
| FASE 5 — Estabilización del cluster | ⏳ Pendiente |
| FASE 6 — API Gateway (Spring Cloud Gateway) | ⏳ Pendiente |
| FASE 7 — GitOps: CI (GitHub Actions) + ArgoCD | ⏳ Pendiente |
| FASE 8 — Observabilidad (Prom/Grafana/Loki/OTel) | ⏳ Pendiente |
| Track paralelo — Tests | ⏳ Pendiente |

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

**3. Missing consumer en order-service** ~~→ ✅ Resuelto~~
~~Se produce `order-shipped` y `order-delivered` desde shipment, pero **order-service no los consume**. El flujo Kafka está a medio hacer. La orden nunca se entera de que su shipment cambió de estado.~~
Actualmente **order-service consume correctamente** `order-shipped` y `order-delivered` vía `OrderConsumer`, actualizando el estado de la orden. El flujo Kafka está completo.

**4. Sin schema registry ni contractos para Kafka**
Los eventos Kafka son `Map<String, Any>` en shipment y objetos tipados en order-service. No hay un esquema compartido (Avro/Protobuf/JSON Schema). Si se cambia la estructura del evento, **no hay forma de saber que se rompió el otro servicio** hasta que explota en runtime.

**5. Typos en nombres de archivos y packages**
- `user-service/src/routes/adddress.route.ts` (triple d)
- `order-service/src/middlewares/validaterHeader.ts` (validator ≠ validater)
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
2. ✅ ~~**Terminar el consumer** en order-service para `order-shipped`/`order-delivered`~~ → Ya implementado
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
| Consumer en order-service (order-preparing / order-shipped / order-delivered) | ✅ Funcionando |
| topic order-preparing desde ShipmentUseCase | ✅ Publicado al crear shipment |
