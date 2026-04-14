# microservices-architecture-ecommerce-lab


## 📌 Descripción

Proyecto de laboratorio enfocado en el diseño e implementación de una **arquitectura de microservicios moderna**, utilizando tecnologías del ecosistema Java Kotlin Javascript y herramientas de infraestructura.

El objetivo es construir un sistema tipo e-commerce como excusa para aplicar:

- Arquitectura hexagonal
- Comunicación entre microservicios
- Autenticación con JWT
- Observabilidad
- Contenerización y orquestación

---

## 🧠 Arquitectura

El sistema sigue un enfoque de microservicios desacoplados:

- Cada servicio tiene su propia base de datos
- Comunicación inicial vía REST (evolucionando a eventos con Kafka)
- Autenticación basada en JWT
- Despliegue sobre contenedores

### Servicios actuales

- 🟦 **user-service** Express/NodeJs o NestJs
  - Registro y autenticación
  - Generación de JWT

- 🟪 **product-service** (Java) SpringBoot
  - Catálogo de productos
  - Integración con FakeStore API
  - Persistencia en PostgreSQL

- 🟨 **order-service** (Kotlin) SpringBoot
  - Creación de órdenes
  - Asociación con usuario autenticado
  - Consumo de product-service

---

## 🛠️ Stack Tecnológico

### Backend
- Java + Spring Boot
- Kotlin + Spring Boot
- Spring Data JPA
- Spring Security (JWT)
- Auth0

### Infraestructura
- Docker
- Docker Compose
- Kubernetes (Minikube)

### Base de datos
- PostgreSQL (una por servicio)

### Observabilidad (fase avanzada)
- Prometheus
- Grafana

### CI/CD (fase avanzada)
- GitHub Actions / Jenkins

---

## 📂 Estructura del proyecto


```bash
microservices-architecture-lab/
│
├── user-service/
├── product-service/
├── order-service/
│
├── docker-compose.yml
└── README.md

```

---

## 🔐 Autenticación

- El usuario se autentica en `user-service`
- Se genera un **JWT**
- Cada microservicio valida el token de forma independiente
- No hay acoplamiento directo con user-service

---




## 🔄 Flujo básico
[Cliente]
↓
[user-service] → JWT
↓
[order-service] → valida token
↓
[product-service] → consulta productos




---

## 🧩 Roadmap Implementacion



### Fase 1: Creación de los Microservicios Core
*Objetivo: Tener dos servicios funcionales que se comunican entre sí.*

1. **Microservicio de Productos (`product-service`):**
   - Framework: Spring Boot 3.x
   - Arquitectura: Hexagonal (Dominio, Adaptadores de entrada/salida).
   - **API y Documentación:** Endpoints REST para CRUD de productos (`/api/v1/products`), documentados con **OpenAPI/Swagger**.
   - **Población de Datos:** Un adaptador de salida usará `RestTemplate` para consumir datos de `fakestoreapi.com` y poblar la base de datos local.
   - Persistencia: Spring Data JPA con PostgreSQL.
   - Lógica de negocio: Gestión de inventario de productos.

2. **Microservicio de Órdenes (`order-service`):**
   - Framework: Spring Boot 3.x
   - Arquitectura: Hexagonal.
   - API: Endpoint para crear órdenes (`/api/v1/orders`).
   - Persistencia: Spring Data JPA con su propia base de datos PostgreSQL.


---


### 🔜 Fase 2 **Integración con Kafka:** 
   - **`product-service`**: No necesita consumir eventos de Kafka inicialmente. - Eventos (`order.created`)
   - **`order-service`**: Al crear una orden, publica un evento `orden-creada` en un topic de Kafka. Esto desacopla la creación de la orden de futuras acciones (notificaciones, facturación, etc.).



---

### Fase 3: Containerización y Despliegue en Minikube
*Objetivo: Mover todo el sistema a un entorno de Kubernetes local.*
- Despliegue en Kubernetes (Minikube)


1. **Dockerizar todo:**
   - Crear un `Dockerfile` para `product-service`, `order-service`, `api-gateway` y `frontend-app` (usando un servidor como Nginx).

2. **Desplegar dependencias en Kubernetes:**
   - Usar Helm o manifiestos YAML para desplegar Kafka, Zookeeper, PostgreSQL y Redis en Minikube.

3. **Desplegar nuestras aplicaciones:**
   - Crear manifiestos de Kubernetes (`Deployment`, `Service`) para cada uno de nuestros servicios.
   - Configurar un `Ingress Controller` para exponer el `api-gateway` al exterior.

---




### 🔜 Fase 4 Resiliencia y Observabilidad
*Objetivo: Hacer el sistema robusto y monitoreable.*
- Observabilidad (Prometheus + Grafana)
- Métricas con Actuator

1. **Métricas con Prometheus y Grafana:**
   - Añadir la dependencia de Spring Boot Actuator y Micrometer a los microservicios.
   - Configurar Prometheus en Kubernetes para que recolecte (scrape) las métricas del endpoint `/actuator/prometheus` de cada servicio.
   - Conectar Grafana a Prometheus y crear un dashboard básico para visualizar métricas (ej. Peticiones HTTP por segundo, latencia).

2. **Cache con Redis:**
   - Implementar una estrategia de cache en `product-service` para la llamada que obtiene la lista de productos. Usaremos las anotaciones `@EnableCaching` y `@Cacheable` de Spring.

3. **Patrón Retry:**
   - Implementar el patrón Retry en el `api-gateway`. Si una llamada a un microservicio falla (ej. `product-service`), que lo reintente 2-3 veces antes de fallar. Usaremos Spring Retry con la anotación `@Retryable`.



---

### Fase 5: Automatización (CI/CD)
*Objetivo: Automatizar el proceso de build y despliegue.*

1. **Crear un Pipeline Básico:**
   - Usar GitHub Actions (o Jenkins).
   - **Trigger:** Al hacer push a la rama `main`.
   - **Pasos:**
     1. Compilar y ejecutar tests de los servicios Spring Boot.
     2. Construir las imágenes Docker.
     3. Pushear las imágenes a un registro (Docker Hub, etc.).
     4. Aplicar los manifiestos de Kubernetes para desplegar la nueva versión (`kubectl apply -f ...`).


---




### Fase 6: Frontend y API Gateway
*Objetivo: Exponer los servicios al exterior y tener una UI para interactuar.*

1. **API Gateway:**
   - Tecnología: Spring Cloud Gateway.
   - Responsabilidad: Servir como punto de entrada único. Enrutará las peticiones: `/api/v1/products/**` a `product-service` y `/api/v1/orders/**` a `order-service`.

---

## Opcional la idea es solo los microservicios

### Fase 7 : **Frontend con React (`frontend-app`):**
   - Crear una aplicación básica con `create-react-app`.
   - Componente principal para mostrar una lista de productos. Hará una llamada al API Gateway (`GET /api/v1/products`).
   - (Opcional en esta fase) Un formulario simple para crear una orden.




## 🐳 Ejecución local

```bash
docker-compose up --build
```




🎯 Objetivo del proyecto

Este proyecto no busca solo funcionar, sino demostrar:

Diseño de sistemas reales
Buenas prácticas de backend
Capacidad de trabajar con múltiples tecnologías
Pensamiento arquitectónico