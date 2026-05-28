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
│  ┌──────────────┐   REST    ┌──────────────┐   Kafka    ┌────────────────┐ │
│  │ user-service  │◄──────┐  │ order-service │◄──────────►│shipment-service│ │
│  │ (Node, auth)  │       │  │ (Node, Kafka) │            │ (Kotlin)       │ │
│  └──────────────┘       │  └──────┬────────┘            └────────────────┘ │
│                          │         │                                        │
│                          │         │ REST                                   │
│                          │         ▼                                        │
│                          │  ┌──────────────┐                               │
│                          └──►product-service│                               │
│                             │ (Java, REST)  │                               │
│                             └──────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Servicios

| Servicio | Lenguaje / Framework | Comunicación | Responsabilidad |
|---|---|---|---|
| **user-service** | Node.js / Express | REST | Registro, login, generación de JWT |
| **product-service** | Java 21 / Spring Boot | REST | Catálogo de productos, CRUD, filtros |
| **order-service** | Node.js / Express + Prisma | REST + Kafka (produce) | Órdenes de compra, estados, publica evento OrderPaid |
| **shipment-service** | Kotlin / Spring Boot 4.0.6 | Kafka (consume) + REST | Prepara pedidos, consume OrderPaid, scheduler de envío |
| **notification-service** | Por definir (futuro) | Kafka (consume) | Notificaciones a clientes (email, etc.) |

---

## 🔄 Flujo de eventos (Kafka)

### Implementado
```
order-service → Kafka "order-paid" → shipment-service (pendiente implementar consumer)

PUT /api/order/:id/status → PAID
  → OrderServiceImpl.updateStatus()
    → Guarda en DB
    → Publica "order-paid" { orderId, customerId, items, ... }
```

### Planificado completo
```
order-service                          shipment-service (Kotlin)
─────────────────                      ─────────────────────────

  PUT /status → PAID (manual)
    → publica "OrderPaid"    ──────►   consume "OrderPaid"
                                          → Crea Shipment(orderId, PREPARING)
                                          → PUT /order/:id/status → PREPARING
                                          → scheduler 3 minutos
                                          → PUT /order/:id/status → SHIPPED
                                          → publica "OrderShipped"

                  ◄────────────────────── consume "OrderShipped"
  consume "OrderShipped"
    → actualiza status a SHIPPED
```

### Eventos del sistema

| Evento | Topic | Producer | Consumer | Estado |
|---|---|---|---|---|
| `OrderPaid` | `order-paid` | order-service | shipment-service | ✅ Producer implementado |
| `OrderShipped` | `order-shipped` | shipment-service | order-service | ⏳ Pendiente |

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
- **Kotlin** + Spring Boot (shipment-service)
- **Node.js** + Express + TypeScript (order-service, user-service)

### Mensajería
- **Apache Kafka** (eventos asíncronos)

### Base de datos (una por servicio)
- PostgreSQL

### Infraestructura
- Docker

---

## 📂 Estructura del proyecto

```bash
microservices-architecture-ecommerce-lab/
│
├── user-service/              # Node/Express + TypeScript
├── products-service/          # Java 21 + Spring Boot / Hexagonal
├── order-service/             # Node/Express + TypeScript + Prisma + Kafka
├── shipment/                  # Kotlin + Spring Boot 4.0.6 + Kafka (consumer pendiente)
├── docker-compose.yml         # Zookeeper + Kafka
├── AGENTS.md                  # Contexto para opencode
└── README.md
```

Cada servicio tiene su propio README con detalles de implementación, endpoints y configuración.

---

## 🧩 Roadmap

### Fase 1: Microservicios Core (REST)
- **product-service** ✅ Catálogo de productos, CRUD, FakeStore API, Swagger
- **user-service** ✅ Registro y login con JWT
- **order-service** ✅ Órdenes, estados, JWT, consumo de products via REST

### Fase 2: Integración Kafka (eventos)
- **order-service** ✅ Produce `OrderPaid` cuando status → PAID
- **shipment-service** 🔧 Consumir `OrderPaid`, crear shipment, producir `OrderShipped`
- Kafka + Zookeeper en Docker Compose ✅

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

## 🚀 Comandos

```bash
# Iniciar Kafka
docker compose up -d

# Order service (dev)
cd order-service && npm run dev

# Shipment service
cd shipment && ./mvnw spring-boot:run
```

---

🎯 **Objetivo del proyecto**

Este proyecto no busca solo funcionar, sino demostrar:

- Diseño de sistemas reales con comunicación síncrona y asíncrona
- Buenas prácticas de backend
- Capacidad de trabajar con múltiples tecnologías (Java, Kotlin, Node, TypeScript)
- Pensamiento arquitectónico
