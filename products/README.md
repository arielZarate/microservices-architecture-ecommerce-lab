# Product Service

Microservicio de gestión de productos que consume la FakeStore API y persiste en PostgreSQL.

## Descripción

Este servicio:
1. Consume la API externa FakeStore API (`https://fakestoreapi.com/products`)
2. Persiste los productos en una base de datos PostgreSQL
3. Expone endpoints REST para gestionar productos

**Comportamiento inicial**: Al iniciar, si la base de datos está vacía, automáticamente consume la API externa y guarda los productos.

## Arquitectura Hexagonal

```
├── domain/                    # Núcleo de negocio
│   ├── models/               # Product (modelo del dominio)
│   └── ports/
│       ├── in/              # ProductsService (interfaz de entrada)
│       └── out/             # ProductsProvider (interfaz de salida)
├── application/              # Casos de uso
│   └── services/            # ProductsUseCase
├── infraestructure/          # Implementaciones
│   ├── adapters/            # ProductsAdapter (persistencia)
│   │   └── mappers/        # ProductsMapper (MapStruct)
│   ├── rest/               # FakeStoreClient (consumo API externa)
│   │   ├── config/         # WebClientConfig
│   │   ├── models/         # FakeStoreProductResponse
│   │   └── providers/      # WebClientProvider
│   └── persistence/         # JPA (ProductRepository, ProductEntity)
└── interfaces/              # Controllers, DTOs, errores
    └── rest/
        ├── dto/            # ProductResponseDTO
        ├── mapper/         # ProductMapper
        └── ProductController
```

### Flujo de datos

```
HTTP Request → Controller → UseCase → Port (interface)
                                     ↓
                              Adapter (impl)
                                     ↓
                        Repository / External Client
```

## Tech Stack

- **Spring Boot 3.5.x**
- **Java 21**
- **PostgreSQL**
- **MapStruct** (mapeo de objetos)
- **Spring WebClient** (consumo API reactiva)
- **SpringDoc OpenAPI** (documentación Swagger)
- **Spring Actuator** (monitoring)

## Controllers

### ProductController

Recibe las peticiones HTTP y devuelve respuestas mapeadas a DTOs.

```java
@RestController
@RequestMapping("/products")
@Tag(name = "Products", description = "Product management endpoints")
public class ProductController {
    private final ProductsService service;
    private final ProductMapper productMapper;

    @Operation(
        summary = "Get all products",
        description = "Returns a list of all products. If database is empty, fetches from FakeStore API."
    )
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getProducts() { ... }
}
```

**Características:**
- Retorna `ProductResponseDTO` (nunca el modelo de dominio directamente)
- Usa `ProductMapper` para convertir Domain → DTO
- Logging con `@Slf4j`
- Anotaciones Swagger (`@Tag`, `@Operation`)

## Swagger/OpenAPI

### Configuración

En `application.yaml`:

```yaml
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
```

### Anotaciones Utilizadas

- `@Tag`: Define el nombre y descripción de un grupo de endpoints
- `@Operation`: Documenta cada endpoint individualmente (summary, description)

### Acceso

| Tipo | URL | Descripción |
|------|-----|-------------|
| **UI Web** | `http://localhost:8080/api/v1/swagger-ui.html` | Interfaz visual interactiva |
| **JSON** | `http://localhost:8080/api/v1/api-docs` | Especificación OpenAPI en JSON |

### Ejemplo de Documentación

Al acceder a Swagger UI verás:
- Nombre: "Products"
- Descripción: "Product management endpoints"
- Endpoint: `GET /products` con descripción de qué hace

## Errores

### Manejo Centralizado

Se utiliza `@ControllerAdvice` para capturar excepciones globalmente.

```java
@ControllerAdvice
@Slf4j
public class ErrorHandler {
    @ExceptionHandler(value = {ExternalClientException.class})
    public ResponseEntity<ClientError> handleException(ExternalClientException ex) { ... }

    @ExceptionHandler(value = {Exception.class})
    public ResponseEntity<ClientError> handleGenericException(Exception ex) { ... }
}
```

### Estructura de Error (RFC 7807)

```java
public record ClientError(
    String type,      // Tipo de error (ej: "internal_error")
    String title,    // Título del error
    int status,      // Código HTTP
    String detail,   // Detalle del error
    String instance  // Instancia/path donde ocurrió
) {}
```

### Excepciones Personalizadas

- `ExternalClientException`: Para errores al consumir APIs externas
- `ApplicationErrorException`: Para errores de negocio internos

## WebClient

### WebClientConfig

Configuración del bean reactivo para consumir APIs HTTP.

```java
@Configuration
public class WebClientConfig {
    @Bean
    public WebClient webClient() {
        return WebClient.builder().build();
    }
}
```

### WebClientProvider

Proveedor genérico para realizar requests HTTP con timeout configurable.

```java
@Component
public class WebClientProvider {
    public <T> T apply(String clientName, WebClientMethod method, 
                       URI uri, Long timeout, Object body, Class<T> responseClass) { ... }
}
```

### FakeStoreClient

Cliente específico que consume la FakeStore API.

```java
@Component
public class FakeStoreClient {
    private static final String BASE_URL = "https://fakestoreapi.com";
    private static final long DEFAULT_TIMEOUT = 5000L;

    public List<FakeStoreProductResponse> getAllProducts() { ... }
}
```

**Características:**
- Timeout configurable (default: 5 segundos)
- Manejo de errores con `ExternalClientException`
- Retry automático en caso de fallo

## Mappers

### ProductsMapper (Infraestructure)

Mapeos entre capas de infraestructura y dominio:

```java
@Mapper(componentModel = "spring")
public interface ProductsMapper {
    Product toDomain(ProductEntity entity);
    ProductEntity toEntity(Product domain);
    
    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "imageUrl", source = "image")
    @Mapping(target = "active", constant = "true")
    Product toDomain(FakeStoreProductResponse response);
}
```

**Nota**: El mapping de `FakeStoreProductResponse` ignora el ID externo y genera uno nuevo (IDENTITY), además de setear `active=true` por defecto.

### ProductMapper (Interfaces)

Mapeo del dominio a DTO de respuesta:

```java
@Mapper(componentModel = "spring")
public interface ProductMapper {
    ProductResponseDTO toDTO(Product product);
}
```

## Endpoints

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/products` | Listar todos los productos |
| GET | `/api/v1/products/{id}` | Obtener producto por ID |
| POST | `/api/v1/products` | Crear producto |
| PUT | `/api/v1/products/{id}` | Actualizar producto |
| DELETE | `/api/v1/products/{id}` | Eliminar producto |

### Actuator
| Endpoint | Descripción |
|----------|-------------|
| `/api/v1/actuator/health` | Estado de salud del servicio |
| `/api/v1/actuator/info` | Información del build |

### Swagger
| Endpoint | Descripción |
|----------|-------------|
| `/swagger-ui.html` | UI de Swagger |
| `/api-docs` | Documentación OpenAPI |

## Configuración

```yaml
server:
  servlet:
    context-path: /api/v1

spring:
  application:
    name: products

  datasource:
    url: jdbc:postgresql://localhost:5432/products_management
    username: postgres
    password: 1111

  jpa:
    hibernate:
      ddl-auto: update

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: always
```

### Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Puerto del servidor | 8080 |
| `SPRING_DATASOURCE_URL` | URL de PostgreSQL | jdbc:postgresql://localhost:5432/products_management |
| `SPRING_DATASOURCE_USERNAME` | Usuario DB | postgres |
| `SPRING_DATASOURCE_PASSWORD` | Password DB | 1111 |

## Dependencias Externas

- **FakeStore API**: `https://fakestoreapi.com/products`
- **PostgreSQL**: localhost:5432

## Compilación

```bash
mvn clean compile
```

## Ejecución

```bash
mvn spring-boot:run
```

El servicio estará disponible en: `http://localhost:8080/api/v1`

## Licencia

**@arieltecnico@gmail.com**