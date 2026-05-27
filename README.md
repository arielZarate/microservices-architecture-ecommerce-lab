# microservices-architecture-ecommerce-lab

## 📌 Descripción

Proyecto de laboratorio enfocado en el diseño e implementación de una **arquitectura de microservicios moderna**,
utilizando tecnologías del ecosistema Java, Kotlin, JavaScript y herramientas de infraestructura.

El objetivo es construir un sistema tipo e-commerce como excusa para aplicar:

- Arquitectura hexagonal
- Comunicación síncrona (REST) y asíncrona (Kafka)
- Autenticación con JWT
- Múltiples lenguajes y frameworks (Node, Java, Kotlin)

---

## 🧠 Arquitectura

Cada servicio tiene su propia base de datos y están desacoplados.
La comunicación se divide en dos tipos según la necesidad:

| Tipo | Tecnología | Para qué |
|---|---|---|
| **Síncrona** | REST | Todo lo que requiere respuesta inmediata (validar producto, autenticar usuario) |
| **Asíncrona** | Kafka (eventos) | Acciones que no necesitan respuesta inmediata (avisar a otros servicios que algo pasó) |

### Diagrama general

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌──────────────┐   REST    ┌──────────────┐   Kafka    ┌───────────────┐  │
│  │ user-service  │◄──────┐  │ order-service │◄──────────►│shipping-service│  │
│  │ (Node, auth)  │       │  │ (Node, Kafka) │            │ (Kotlin)      │  │
│  └──────────────┘       │  └──────┬────────┘            └───────────────┘  │
│                          │         │                                        │
│                          │         │ REST                                   │
│                          │         ▼                                        │
│                          │  ┌──────────────┐   ┌──────────────────┐        │
│                          └──►product-service│   │notification-svc  │        │
│                             │ (Java, REST)  │   │ (futuro)         │        │
│                             └──────────────┘   └──────────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Servicios

| Servicio | Lenguaje / Framework | Comunicación | Responsabilidad |
|---|---|---|---|
| **user-service** | Node.js / Express | REST | Registro, login, generación de JWT |
| **product-service** | Java 21 / Spring Boot | REST (no usa Kafka) | Catálogo de productos, CRUD, filtros |
| **order-service** | Node.js / Express + Prisma | REST + Kafka (produce y consume) | Órdenes de compra, estados, validación con products |
| **shipping-service** | Kotlin / Spring Boot (nuevo) | Kafka (consume y produce) | Prepara pedidos, scheduler de envío, actualiza estados |
| **notification-service** | Por definir (futuro) | Kafka (consume) | Notificaciones a clientes (email, etc.) |

---

## 🔄 Flujo de eventos (Kafka)

El corazón asíncrono del sistema. order-service produce eventos, shipping-service los consume, procesa y responde.

```
order-service                          shipping-service (Kotlin)          notification-service (futuro)
─────────────────                      ────────────────────────────       ────────────────────────────

  Crea orden
    → REST GET /products/{id}
    → Guarda en DB
    → publica "OrderCreated" ──────►   consume (solo log, sin acción)

  PUT /status → PAID (manual)
    → publica "OrderPaid"    ──────►   consume "OrderPaid"
                                          → PUT /order/:id/status → PREPARING
                                          → scheduler 3 minutos
                                          → PUT /order/:id/status → SHIPPED
                                          → publica "OrderShipped"

                  ◄──────────────────────── consume "OrderShipped"
  consume "OrderShipped"
    → actualiza status a SHIPPED
                                                                ┌──► consume eventos
                                                                │   (futuro: notificar
                                                                │    al cliente)
```

### Eventos del sistema

| Evento | Producer | Consumer | Cuándo ocurre |
|---|---|---|---|
| `OrderCreated` | order-service | shipping-service (log) | Se crea una orden nueva |
| `OrderPaid` | order-service | shipping-service | Pago simulado (manual) |
| `OrderShipped` | shipping-service | order-service, notification-svc (futuro) | Envío completado tras 3 min |

> **Importante:** product-service solo usa REST. Cuando order-service crea una orden, llama síncronamente a `GET /products/{id}` para validar el producto y obtener precio/nombre. No entra en el flujo de Kafka.

---

## 🔐 Autenticación (JWT)

Todos los microservicios comparten el mismo `JWT_SECRET`. user-service genera los tokens, el resto los valida.

```
Frontend → POST /api/auth/login { email, password }
                ↓
         user-service valida credenciales
                ↓
         Genera JWT con payload: { sub: userId, name, email }
                ↓
         Devuelve { token }

→ Cada request lleva: Authorization: Bearer <token>
→ Cada microservicio valida el token localmente (sin llamar a user-service)
→ Solo user-service puede generar tokens (register/login)
```

---

## 🛠️ Stack Tecnológico

### Backend
- **Java** + Spring Boot (product-service)
- **Kotlin** + Spring Boot (shipping-service)
- **Node.js** + Express + TypeScript (order-service, user-service, notification-service)
- Spring Data JPA
- Prisma ORM

### Mensajería
- **Apache Kafka** (eventos asíncronos)

### Base de datos (una por servicio)
- PostgreSQL
- MySQL
- MongoDB (no SQL, opcional)

### Infraestructura
- Docker
- Kubernetes (Minikube)

### Observabilidad (fase avanzada)
- Prometheus + Grafana

---

## 📂 Estructura del proyecto

```bash
microservices-architecture-lab/
│
├── user-service/              # Node/Express + TypeScript
├── products-service/          # Java 21 + Spring Boot / Hexagonal
│   ├── src/main/java/
│   │   ├── domain/            # Modelos y puertos
│   │   ├── application/       # Casos de uso
│   │   ├── infraestructure/   # Adapters, persistence, rest
│   │   └── interfaces/        # Controllers, DTOs, errores
│   └── README.md
├── order-service/             # Node/Express + TypeScript + Prisma + Kafka
├── shipping-service/          # Kotlin + Spring Boot + Kafka (nuevo)
├── notification-service/      # (futuro)
├── docker-compose.yml         # Zookeeper, Kafka, DBs
└── README.md                  # ← Estás acá
```

Cada servicio tiene su propio README con detalles de implementación, endpoints y configuración.

---

## 🧩 Roadmap

### Fase 1: Microservicios Core (REST)
- **product-service** (Java) ✅ Catálogo de productos, CRUD, FakeStore API, Swagger
- **user-service** 🔄 Registro y login con JWT
- **order-service** 🔄 Órdenes, estados, JWT, consumo de products via REST

### Fase 2: Integración Kafka (eventos)
- **order-service** → Produce `OrderCreated`, `OrderPaid`. Consume `OrderShipped`
- **shipping-service** (Kotlin) → Consume `OrderPaid`, produce `OrderShipped` con scheduler 3 min
- Kafka + Zookeeper en Docker Compose

### Fase 3: Containerización
- Dockerizar todos los servicios
- Despliegue en Minikube

### Fase 4: Observabilidad
- Prometheus + Grafana
- Métricas con Actuator

### Fase 5: CI/CD
- GitHub Actions (build, test, push, deploy)

### Fase 6: Frontend + API Gateway
- React + API Gateway (Spring Cloud Gateway o K8s Ingress)

### Fase 7: Notification Service
- Nuevo micro que consume eventos de Kafka y notifica al cliente

---

🎯 **Objetivo del proyecto**

Este proyecto no busca solo funcionar, sino demostrar:

- Diseño de sistemas reales con comunicación síncrona y asíncrona
- Buenas prácticas de backend
- Capacidad de trabajar con múltiples tecnologías (Java, Kotlin, Node, TypeScript)
- Pensamiento arquitectónico
