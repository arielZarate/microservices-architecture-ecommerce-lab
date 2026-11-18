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
X-Middleware-ApiKey: idAppXTW37key
X-Middleware-DeviceId: idDeviceZJA7Device
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
X-Middleware-ApiKey: idAppXTW37key
X-Middleware-DeviceId: idDeviceZJA7Device
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
├── microservices/                  # código de los servicios
│   ├── products-service/
│   ├── order-service/
│   ├── user-service/
│   └── shipment-service/
│
├── infra/
│   └── docker/postgres/init/       # 01-databases.sql: crea las 4 bases
│
├── k8s/                            # Fase 3 (en construcción)
│   ├── config/
│   └── services/
│
├── docs/
│   └── configuracion-y-entornos.md # Fase 2.5: .env, ConfigMap/Secret
│
├── docker-compose.yml              # entorno local: Postgres + Kafka + servicios
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
| `products-service` | build `./microservices/products-service` | 8080 | Catálogo de productos | ✅ |
| `shipment-service` | build `./microservices/shipment-service` | 8081 | Envíos + Kafka | ✅ |
| `order-service` | build `./microservices/order-service` | 3000 | Órdenes + Kafka | ✅ |
| `order-service-migrate` | build `./microservices/order-service` | — | `prisma migrate deploy` (sale con 0) | ✅ |
| `user-service` | build `./microservices/user-service` | 4000 | Usuarios + JWT | ✅ |
| `user-service-migrate` | build `./microservices/user-service` | — | `prisma migrate deploy` (sale con 0) | ✅ |
| `kafka-container` | `apache/kafka:4.3.0` | 9092 | Broker (KRaft) + volumen `kafka-data` | ✅ |
| `kafka-init` | `apache/kafka:4.3.0` | — | Crea los 4 topics (sale con 0) | ✅ |

Total: **9 contenedores** (1 de DB + 4 de apps + 2 jobs de migración + 2 de Kafka).

### Cómo se crean las bases de datos

- La imagen oficial de Postgres ejecuta todo `.sql` de `/docker-entrypoint-initdb.d/` **solo la primera vez** (volumen vacío).
- Las 4 bases se crean en `infra/docker/postgres/init/01-databases.sql`.
- El compose monta esa carpeta: `./infra/docker/postgres/init:/docker-entrypoint-initdb.d:ro`.

```sql
-- infra/docker/postgres/init/01-databases.sql
CREATE DATABASE products_management;
CREATE DATABASE shipment_management;
CREATE DATABASE orders_management;
CREATE DATABASE users_management;
```

### Cómo se conectan los servicios a la DB

Dentro de la red `ecommerce` de compose, el host de la DB es el **nombre del servicio** (`postgres`), **no** `localhost` (dentro de un contenedor, `localhost` es el contenedor mismo).

Las credenciales/URL se inyectan por variables de entorno y **completan** los placeholders `${VARIABLE}` del `application.yaml` (relaxed binding):

| Variable de entorno | Propiedad de Spring | Equivalente en Node |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `spring.datasource.url` | `DATABASE_URL` (solo CLI de Prisma) |
| `SPRING_DATASOURCE_USERNAME` | `spring.datasource.username` | `DATASOURCE_USERNAME` |
| `SPRING_DATASOURCE_PASSWORD` | `spring.datasource.password` | `DATASOURCE_PASSWORD` |

> Los Node **no** usan una URL: arman la conexión con campos sueltos vía `PrismaPg`. `DATABASE_URL` existe solo para la CLI (`prisma migrate`/`generate`), que la lee de `prisma.config.ts`.

Ejemplo (products-service en `docker-compose.yml`):

```yaml
    depends_on:
      postgres:
        condition: service_healthy       # no arranca hasta que la DB esté lista
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/products_management
      SPRING_DATASOURCE_USERNAME: ${SPRING_DATASOURCE_USERNAME}
      SPRING_DATASOURCE_PASSWORD: ${SPRING_DATASOURCE_PASSWORD}
    networks: [ ecommerce ]
```

Las credenciales salen del `.env` raíz, **sin defaults** en el compose: si falta la variable, el compose falla en vez de arrancar con un valor inventado.

El `application.yaml` no tiene valores: solo `${VARIABLE}`. Los valores de desarrollo (`localhost:5432`) viven en `application-dev.yaml`, que es el que se activa al correr desde el IDE con el perfil `dev`.

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
- Las credenciales viven en un `.env` raíz (no versionado) + `.env.example` de plantilla (versionado). ✅ Fase 2.5 completada (ver el final de este README).
- Las 4 bases usan la misma credencial: `${SPRING_DATASOURCE_USERNAME}` / `${SPRING_DATASOURCE_PASSWORD}` desde el `.env` raíz.
- Kafka tiene **doble listener**: `PLAINTEXT://localhost:9092` para el host e `INTERNAL://kafka-container:29092` para los contenedores. Persiste en el volumen `kafka-data` (`KAFKA_LOG_DIRS`).
- `order-service` espera `kafka` + `kafka-init` (`condition: service_completed_successfully`) para no quedar sordo si Kafka arranca después.

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

- [x] Un `Dockerfile` multi-stage + `.dockerignore` por servicio

**Criterio de éxito:** las 4 imágenes buildeadas y cada una responde su endpoint de health. ✅

---

#### 🥈 FASE 2 — Docker Compose completo (infra + servicios)

##### `docker-compose.yml` (infra + servicios en un solo archivo) — ✅ creado
- Kafka (KRaft) con doble listener y volumen `kafka-data` — ✅
- PostgreSQL — **1 instancia con 4 bases** (ver [Infraestructura local](#infraestructura-local-docker-compose)) — ✅
  - `postgres` → `products_management`, `shipment_management`, `orders_management`, `users_management` → host :5432
  - *Alternativa (si se necesita aislamiento): 4 instancias separadas, una por servicio.*
- `kafka-init` — crea **todos** los topics: `order-paid`, `order-preparing`, `order-shipped`, `order-delivered` — ✅

Se ejecuta solo (para desarrollo local con `npm run dev`):
```bash
docker compose up -d
```

##### Servicios en el mismo `docker-compose.yml`
- [x] Los 4 servicios con `build:` apuntando a su Dockerfile
- [x] `depends_on` a su DB respectiva + Kafka
- [x] Variables de entorno apuntando a **nombres de servicio** (no `localhost`)
- [x] Puertos mapeados (4000, 3000, 8080, 8081)
- [x] Jobs de migración (`prisma migrate deploy`) para user y order

Se ejecuta todo junto:
```bash
docker compose up -d
```

**Criterio de éxito:** stack completo verde con un solo comando y el flujo de pedido funciona end-to-end. ✅ (validado 2026-11-05)

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
- [ ] Config centralizada: `ConfigMap` por ambiente + `Secret` (`JWT_SECRET`, `EXTERNAL_API_KEY`, `EXTERNAL_DEVICE_ID`, credenciales de DB)
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
| Config por entorno (Fase 2.5) | ✅ `.env` raíz + por servicio, `${VAR}` en yaml, `validateEnv()` |

### Infraestructura (Docker → Minikube → GitOps)

| Fase | Estado |
|---|---|
| FASE 1 — Dockerfiles (4 servicios) | ✅ 4/4 |
| FASE 2 — Docker Compose completo (infra + servicios) | ✅ Infra + 4 servicios + migraciones |
| FASE 2.5 — Configuración y variables de entorno | ✅ `.env` + `.env.example`; los ConfigMap/Secret son de Fase 3 |
| FASE 3 — Kubernetes base (Minikube) | ⏳ Pendiente |
| FASE 4 — Infra interna en K8s (StatefulSets) | ⏳ Pendiente |
| FASE 5 — Estabilización del cluster | ⏳ Pendiente |
| FASE 6 — API Gateway (Spring Cloud Gateway) | ⏳ Pendiente |
| FASE 7 — GitOps: CI (GitHub Actions) + ArgoCD | ⏳ Pendiente |
| FASE 8 — Observabilidad (Prom/Grafana/Loki/OTel) | ⏳ Pendiente |
| Track paralelo — Tests | ⏳ Pendiente |

---

## Estado actual y pendientes (2026-11-18)

> Este README es la **fuente única de verdad**. Las notas de sesiones anteriores
> (`~/.config/opencode/context/microservices-architecture-ecommerce-lab/`) fueron absorbidas acá.

### Últimos commits

- `dd7a21c` fix: JWT secret con longitud mínima para HS256
- `769dbae` Merge PR #27 — entornos de order y user
- `de3b891` entornos de shipment-service
- `bd63e50` refactor entorno products-service

### Flujo end-to-end validado

Pago disparado manualmente con `PUT /api/order/{id}/status` → `PAID`:

| Hora | Evento |
|---|---|
| 23:21:17 | Imagen nueva de `order-service` (rebuild aplicado) |
| 23:21:35 | Arranca con `groupId: order-service-group` |
| 23:21:48 | `GET /api/order/:id` → 200 **sin token** |
| 23:22:28 | `PUT PAID` → publica `order-paid` |
| 23:22:29 | shipment consume `order-paid`, crea shipment + address, publica `order-preparing` |
| 23:22:29 | order consume `order-preparing` → PREPARING |
| 23:24:00 | cron shipment PREPARING → SHIPPED → `order-shipped` |
| 23:24:00 | order consume → SHIPPED |
| 23:24:30 | cron shipment SHIPPED → DELIVERED → `order-delivered` |
| 23:24:30 | order consume → DELIVERED |

Estado final en DB para la orden `6518a415-98f9-4175-9322-8639dfdc43ae`:
`Order.status = DELIVERED` · `shipment.status = DELIVERED` (mismo UUID) ·
`shipment_item`: product 5, qty 2, unitPrice 695 · `address`: "los sirios 6331", Cerro, Córdoba, 5000.
Sin duplicados, sin replay, sin rebalanceos.

### Seguridad de endpoints (order-service)

| Endpoint | Protección |
|---|---|
| `GET /api/order` | ninguna |
| `GET /api/order/:id` | ninguna |
| `GET /api/order/my` | JWT (lo necesita por `userContext`) |
| `POST /api/order` | JWT |
| `PUT /api/order/:id/status` | API Key + Device ID (`validateHeader`), sin JWT |

> `GET /my` sin JWT rompe con `User context is missing`; se dejó con JWT.

### Pendientes priorizados

#### A. Fase 2.5 — `.env`, secretos y variables ✅
- [x] **Decisión A:** `.env` raíz para Compose **y** `.env` por servicio para `npm run dev` (Spring no lee `.env`; Compose solo interpola los `${VAR}` del yaml).
- [x] **Decisión B:** el compose queda **sin defaults** de secretos.
- [x] **Decisión C:** Fase 2.5 resuelta antes de empezar Fase 3.
- [x] `.env.example` raíz + `.env` raíz, y `.env.example` propio en order y user.
- [x] `JWT_SECRET`, `EXTERNAL_API_KEY`, `EXTERNAL_DEVICE_ID` por `${VARIABLE}` en los yaml Java; los valores de dev viven en `application-dev.yaml`.
- [x] Rename en Node: `DB_*` → `DATASOURCE_*`, `API_KEY` / `DEVICE_ID` → `EXTERNAL_*`.
- [x] `src/config/env.ts` + `validateEnv()` en order y user (falla al arrancar si falta una variable).

#### B. Fixes de código en order-service (bajo riesgo)
- [ ] Agregar `OrderPreparingEvent` a la unión `OrderStatusEvent` (`order-event.interface.ts:26`).
- [ ] Mensaje de error en `create` usa `products[index]` en vez de `item.getProductId()`.
- [ ] Quitar `&& orderSaved.getId()` redundante.

#### C. Decisiones arquitectónicas abiertas
- [ ] `CANCELLED` no se propaga a shipment: ¿topic `order-cancelled` + consumer, o prohibir cancelar post-`PAID`?
      (La constraint de `shipment.status` solo acepta `PREPARING | SHIPPED | DELIVERED`.)
- [ ] `order-paid` se pierde en silencio si falla el publish: ¿outbox pattern o deuda documentada?
- [ ] TOCTOU en `updateStatus` (dos PUT concurrentes pueden publicar `order-paid` dos veces).
- [ ] `OrderStatusDTO` no incluye `DELIVERED` (`status.order.dto.ts`).
- [ ] Producer usa `key: crypto.randomUUID()` en vez de `orderId` (importa con >1 partición).
- [ ] `tracking_code` queda NULL: definir si se genera.

#### D. Fase 3 — Kubernetes / Minikube
- [ ] `minikube start --addons=ingress` · namespace `lab`
- [ ] Deployment + Service + ConfigMap + Secret + Ingress por servicio
- [ ] `minikube image load` de las 4 imágenes
- [ ] E2E de un pedido a través del Ingress, todo con `kubectl apply`

#### E. Limpieza menor
- [ ] 5 órdenes en `PENDING` de pruebas anteriores (22:46 y 23:05): borrar o dejar como historial.

### Histórico de sesiones (absorbido)

| Fecha | Tema | Resultado |
|---|---|---|
| 2026-06-04 | Análisis arquitectónico | Diagnóstico de lo bueno/crítico/discutible y prioridades |
| 2026-09-02 | Fix shipment → Kafka/WebClient | Comunicación shipment→user resuelta |
| 2026-09-02 | Shipment address + API Key | Address client completo con headers internos |
| 2026-09-02 | Kafka + ShedLock + cron | Transiciones automáticas con lock distribuido |
| 2026-09-02 | Shipment status cron | PREPARING → SHIPPED → DELIVERED |
| 2026-10-16 | Plan de despliegue DevOps | Arquitectura objetivo Docker → Minikube → GitOps |
| 2026-10-19 | Dockerización user-service | Fase 1 aplicada a user-service |
| 2026-10-30 | Dockerización order-service + Prisma/Kafka | Fase 1 aplicada a order-service |
| 2026-10-30 | Cierre Fase 1/2 + P1–P7 + Fase 2.5 | Compose único, decisiones pendientes |
| 2026-10-31 → 2026-11-05 | Revisión order-service y estado | P1–P6 cerrados, E2E validado, seguridad de endpoints ajustada |
| 2026-11-17 → 2026-11-18 | Fase 2.5 cerrada | `.env.example` raíz + order + user, `${VAR}` en yaml, `validateEnv()`, fix JWT 32 bytes |

### Conexiones de desarrollo

- PostgreSQL: `localhost:5432` · user `postgres` · password `admin`
- DBeaver: conexión guardada `postgres_container`
- Kafka: `localhost:9092` (host) / `kafka-container:29092` (interno)
- Servicios: user `:4000`, order `:3000`, products `:8080`, shipment `:8081`

---

## Comandos (desarrollo local)

```bash
# Variables de entorno (una vez)
cp .env.example .env                      # raíz: lo lee docker compose
cp microservices/order-service/.env.example microservices/order-service/.env
cp microservices/user-service/.env.example  microservices/user-service/.env

# Iniciar Kafka
docker compose up -d

# Order service
cd microservices/order-service && npm run dev

# User service
cd microservices/user-service && npm run dev

# Shipment service
cd microservices/shipment-service && ./mvnw spring-boot:run

# Products service
cd microservices/products-service && ./mvnw spring-boot:run
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
| **Topics Kafka creados (kafka-init en compose)** | ✅ **order-paid + order-preparing + order-shipped + order-delivered** |
| Consumer en order-service (order-preparing / order-shipped / order-delivered) | ✅ Funcionando |
| topic order-preparing desde ShipmentUseCase | ✅ Publicado al crear shipment |

---

## Fase 2.5 — Configuración y variables de entorno ✅

> ✅ **Completada (2026-11-18).** El antiguo `docs/configuracion-y-entornos.md` fue absorbido por esta sección y ya no existe.

> Regla: **cada microservice es dueño de su configuración; los valores compartidos se inyectan desde afuera.**
> Esta fase va **antes de Kubernetes**, porque en K8s la config se pasa por ConfigMap/Secret y no por `.env`.

### Dos grupos de variables

#### 1. Propias de cada microservice

No se unifican: cada servicio las define y puede cambiarlas sin afectar a los demás.

| Servicio | Variables propias |
|---|---|
| `user-service` | `PORT`, `DATASOURCE_HOST`, `DATASOURCE_PORT`, `DATASOURCE_USERNAME`, `DATASOURCE_PASSWORD`, `DATASOURCE_NAME_DATABASE`, `DATABASE_URL` (solo CLI de Prisma) |
| `order-service` | `PORT`, `DATASOURCE_*`, `DATABASE_URL` (solo CLI), `KAFKA_BROKER`, `KAFKA_GROUP_ID`, `PRODUCT_SERVICE_HOST`, `TIMEOUT_MS` |
| `products-service` | `SPRING_DATASOURCE_URL`, `server.port`, `springdoc.*` |
| `shipment-service` | `SPRING_DATASOURCE_URL`, `SPRING_KAFKA_BOOTSTRAP_SERVERS`, `EXTERNALS_USER_CLIENT_HOST`, `EXTERNALS_ADDRESS_CLIENT_HOST`, `server.port`, `scheduled.*` |

> `DATASOURCE_USERNAME` / `DATASOURCE_PASSWORD` (Node) y `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` (Java + Postgres) llevan **el mismo valor**, pero con el nombre que espera cada stack.

#### 2. Compartidas (contrato entre servicios)

Tienen que ser **idénticas en todos**. Si cambian en uno solo, el flujo se rompe.

| Variable | Quién la usa | Por qué |
|---|---|---|
| `JWT_SECRET` | user (firma), order/products (validan) | mismo secreto para firmar y verificar. **≥ 32 bytes**: jjwt rechaza HS256 con menos |
| `EXTERNAL_API_KEY` | los 4 | header `X-Middleware-ApiKey` |
| `EXTERNAL_DEVICE_ID` | los 4 | header `X-Middleware-DeviceId` |
| `SPRING_DATASOURCE_USERNAME` | infra + los 4 | conexión a PostgreSQL |
| `SPRING_DATASOURCE_PASSWORD` | infra + los 4 | conexión a PostgreSQL |

### Estado: resuelto

Antes las compartidas estaban repetidas en tres capas, con defaults hardcodeados. Ahora:

| Capa | Cómo queda |
|---|---|
| Dev local | `.env` de cada servicio (gitignoreado) + `.env.example` versionado |
| Docker Compose | `.env` raíz (gitignoreado) + `.env.example`; el compose **no tiene defaults de secretos** |
| Java | `application.yaml` solo `${VAR}` sin default; los valores de dev viven en `application-dev.yaml` |

### Modelo objetivo por entorno

| Entorno | Propias | Compartidas |
|---|---|---|
| Dev (`npm run dev` / `mvn spring-boot:run`) | `.env` o `application-dev.yaml` de cada micro | repetidas en el `.env` de cada micro |
| Docker Compose | `environment:` de cada servicio | `.env` raíz |
| Kubernetes (Fase 3) | ConfigMap por servicio | Secret `ecommerce-secrets` |

Patrón en K8s:

```yaml
envFrom:
  - configMapRef: { name: order-service-config }
  - secretRef:    { name: ecommerce-secrets }
```

> Ojo: `envFrom` no renombra claves. Los Node leen `DATASOURCE_USERNAME` y Spring lee `SPRING_DATASOURCE_USERNAME`, así que las credenciales de DB van con `env:` + `secretKeyRef:` explícito en los servicios Node.

### Pasos concretos ✅

- [x] Crear `.env.example` raíz (versionado, con valores de lab).
- [x] Crear `.env` raíz (real, gitignoreado).
- [x] Pasar `JWT_SECRET`, `EXTERNAL_API_KEY` y `EXTERNAL_DEVICE_ID` de los yaml de Java a `${VARIABLE}`.
- [x] Sacar los defaults de secretos del compose y resolverlos desde el `.env` raíz.
- [x] Documentar en cada servicio qué variables son propias y cuáles compartidas (`.env.example` de cada uno).
- [x] Renombrar en los Node `DB_*` → `DATASOURCE_*` y `API_KEY` / `DEVICE_ID` → `EXTERNAL_*`.
- [x] Agregar `src/config/env.ts` + `validateEnv()` en order y user.
