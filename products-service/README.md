# Product Service

Microservicio de gestión de productos que consume la FakeStore API y persiste en PostgreSQL.

## Descripción

Este servicio:
1. Consume la API externa FakeStore API (`https://fakestoreapi.com/products`)
2. Persiste los productos y categorías en una base de datos PostgreSQL
3. Expone endpoints REST para gestionar productos y categorías

**Comportamiento inicial**: Al iniciar, si la base de datos está vacía, automáticamente consume la API externa y guarda los productos.

## Arquitectura Hexagonal

```
├── domain/                    # Núcleo de negocio
│   ├── models/               # Product, Category (modelos del dominio)
│   └── ports/
│       ├── in/              # ProductService, CategoryService (interfaces de entrada)
│       └── out/             # ProductProvider, CategoryProvider (interfaces de salida)
├── application/              # Casos de uso
│   └── services/            # ProductUseCase, CategoryUseCase
├── infraestructure/          # Implementaciones
│   ├── adapters/            # ProductAdapter, CategoryAdapter (persistencia)
│   │   └── mappers/        # ProductsMapper, CategoryMapper (MapStruct)
│   ├── rest/               # FakeStoreClient (consumo API externa)
│   │   ├── config/         # WebClientConfig
│   │   ├── models/         # FakeStoreProductResponse
│   │   └── providers/      # WebClientProvider
│   └── persistence/         # JPA (ProductRepository, CategoryRepository, ProductEntity, CategoryEntity)
└── interfaces/              # Controllers, DTOs, errores
    └── rest/
        ├── dto/            # ProductResponseDTO, CategoryResponseDTO
        ├── mapper/         # ProductMapperDTO, CategoryMapperDTO
        └── ProductController, CategoryController
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
| **UI Web** | `http://localhost:8080/api/swagger-ui.html` | Interfaz visual interactiva |
| **JSON** | `http://localhost:8080/api/api-docs` | Especificación OpenAPI en JSON |

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

## Modelos y DTOs

### Domain Models

**Product**
```java
public class Product {
    private Long productId;
    private String title;
    private Double price;
    private String description;
    private Long categoryId;
    private Boolean active;
    private String imageUrl;
    private Rating rating;
}
```

**Category**
```java
public class Category {
    private Long id;
    private String name;
    private Boolean active;
}
```

**Rating**
```java
public class Rating {
    private Double rate;
    private Integer count;
}
```

### DTOs

**ProductRequestDTO** (POST/PUT)
```java
public class ProductRequestDTO {
    private String title;           // required
    private Double price;          // required, > 0
    private String description;     // optional
    private Long categoryId;        // required, > 0
    private String imageUrl;        // optional
    private RatingRequestDTO rating; // optional
}
```

**ProductResponseDTO** (GET response)
```java
public record ProductResponseDTO(
    Long productId,
    String title,
    Double price,
    String description,
    Long categoryId,
    Boolean active,
    String imageUrl,
    RatingResponseDTO rating
)
```

### BaseEntity (Soft Delete)

```java
@MappedSuperclass
public abstract class BaseEntity {
    private Long id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private Boolean isActive = true;
    
    public void softDelete() {
        this.isActive = false;
        this.deletedAt = LocalDateTime.now();
    }
    
    public void softActive() {
        this.isActive = true;
        this.deletedAt = null;
    }
}
```

## Seguridad (JWT + API Key)

Products-service implementa **doble autenticación** para endpoints de escritura:

### Flujo de validación

```
Request → ¿GET público? → sí → pase
         ↓ no
         ¿JWT (Bearer token) válido? → sí → pase
         ↓ no
         ¿API Key + DeviceId válidos? → sí → pase
         ↓ no
         401 Unauthorized
```

### Endpoints públicos (GET)
| Ruta | Método |
|---|---|
| `/api/products` | GET |
| `/api/products/{id}` | GET |
| `/api/category` | GET |
| `/api/category/{id}` | GET |

### Endpoints protegidos (requieren JWT o API Key)
| Ruta | Métodos |
|---|---|
| `/api/products` | POST |
| `/api/products/{id}` | PUT, DELETE |
| `/api/products/{id}/activate` | POST |
| `/api/category` | POST |
| `/api/category/{id}` | PUT, DELETE |
| `/api/category/{id}/activate` | POST |

### Cabeceras aceptadas
- **JWT**: `Authorization: Bearer <token>` (usuarios frontend)
- **API Key interna**: `X-Middleware-ApiKey` + `X-Middleware-DeviceId` (comunicación entre microservicios)

### Implementación
- `interfaces/middleware/HeaderFilter.java`: OncePerRequestFilter con lógica JWT → API Key → 401
- `interfaces/middleware/security/JwtUtil.java`: Validación de tokens JWT con jjwt 0.12.6
- Dependencia: `io.jsonwebtoken:jjwt:0.12.6`

---

## Endpoints

### Productos
| Método | Endpoint | Descripción | Status Codes |
|--------|----------|-------------|--------------|
| GET | `/api/products` | Listar todos los productos (opcional: ?categoryId=1&search=jacket) | 200, 500 |
| GET | `/api/products/{id}` | Obtener producto por ID | 200, 404, 500 |
| POST | `/api/products` | Crear producto | 201, 400, 500 |
| PUT | `/api/products/{id}` | Actualizar producto | 200, 400, 404, 500 |
| DELETE | `/api/products/{id}` | Soft delete (isActive=false) | 204, 404, 500 |
| POST | `/api/products/{id}/activate` | Soft activate (isActive=true) | 204, 404, 500 |

### Categorías
| Método | Endpoint | Descripción | Status Codes |
|--------|----------|-------------|--------------|
| GET | `/api/category` | Listar todas las categorías (opcional: ?name=electronics) | 200, 500 |
| GET | `/api/category/{id}` | Obtener categoría por ID | 200, 404, 500 |
| POST | `/api/category` | Crear categoría | 201, 409, 500 |
| PUT | `/api/category/{id}` | Actualizar categoría | 200, 404, 409, 500 |
| POST | `/api/category/{id}/activate` | Soft activate (isActive=true) | 204, 404, 500 |
| DELETE | `/api/category/{id}` | Soft delete (isActive=false) | 204, 404, 500 |

**Filtros opcionales en GET /products:**
- `categoryId`: Filtrar por ID de categoría
- `search`: Buscar por nombre de producto (mínimo 2 caracteres)
- Ejemplo: `GET /api/products?categoryId=1&search=jacket`

**Soft Delete/Activate:**
- DELETE y POST /activate usan el campo `isActive` de `BaseEntity`
- No eliminan físicamente el registro, solo lo desactivan

## Filtros de Productos

### Spring Data JPA Derived Queries

El repository utiliza métodos de Spring Data JPA que generan JPQL automáticamente:

```java
@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
    List<ProductEntity> findByCategoryId(Long categoryId);
    List<ProductEntity> findByTitleContainingIgnoreCase(String title);
    List<ProductEntity> findByCategoryIdAndTitleContainingIgnoreCase(Long categoryId, String title);
}
```

### Lógica de Filtrado (ProductAdapter)

```java
@Override
public List<Product> getProducts(Long categoryId, String search) {
    // If both filters are null/blank, return all products (original behavior)
    if (categoryId == null && (search == null || search.isBlank())) {
        return fetchOrCreateProducts();
    }

    // Apply filters based on what is provided
    List<ProductEntity> entities;

    if (categoryId != null && search != null && !search.isBlank()) {
        // Both filters applied
        entities = productRepository.findByCategoryIdAndTitleContainingIgnoreCase(categoryId, search);
    } else if (categoryId != null && (search == null || search.isBlank())) {
        // Only categoryId filter
        entities = productRepository.findByCategoryId(categoryId);
    } else {
        // Only search filter
        entities = productRepository.findByTitleContainingIgnoreCase(search);
    }

    return entities.stream().map(productsMapper::toDomain).collect(Collectors.toList());
}
```

### Validación (ProductUseCase)

```java
@Override
public List<Product> getAllProducts(Long categoryId, String search) {
    // Validate search term has at least 2 characters if provided
    if (search != null && !search.isBlank() && search.length() < 2) {
        throw new ApplicationErrorException(ApplicationError.badRequest("Search term must be at least 2 characters"));
    }
    // Delegate to provider with optional filters
    return productsProvider.getProducts(categoryId, search);
}
```

### Uso

| Request | Resultado |
|---------|-----------|
| `GET /api/products` | Todos los productos |
| `GET /api/products?categoryId=1` | Productos de categoría 1 |
| `GET /api/products?search=jacket` | Productos con "jacket" (mín 2 caracteres) |
| `GET /api/products?categoryId=1&search=jacket` | Ambos filtros |
| `GET /api/products?search=a` | 400 Bad Request (menos de 2 caracteres) |

### Actuator
| Endpoint | Descripción |
|----------|-------------|
| `/api/actuator/health` | Estado de salud del servicio |
| `/api/actuator/info` | Información del build |

### Swagger
| Endpoint | Descripción |
|----------|-------------|
| `/api/swagger-ui.html` | UI de Swagger |
| `/api/api-docs` | Documentación OpenAPI |

## Configuración

```yaml
server:
  servlet:
    context-path: /api

spring:
  application:
    name: products-service

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

El servicio estará disponible en: `http://localhost:8080/api`

## Licencia

**@arieltecnico@gmail.com**