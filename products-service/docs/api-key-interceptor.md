# API Key HeaderFilter para products-service

## Contexto

El **products-service** es llamado por **order-service** cuando se crea una orden. Solo ciertos endpoints deben ser públicos (GET de productos y categorías); el resto requiere API Key interna.

```
order-service → GET /api/products/{id} → products-service (público)
order-service (interno) → POST/PUT/DELETE /api/products → requiere API Key
```

Headers de validación:

```
X-Middleware-ApiKey: idApp1237897key
X-Middleware-DeviceId: idDevice321567Device
```

**Decisión final:** Se implementó con `OncePerRequestFilter` por ser el estándar de seguridad en Spring Boot (Spring Security también usa Filters).

---

## Opción 1 — HandlerInterceptor (Recomendada)

### ¿Qué es?

`HandlerInterceptor` es una interfaz de Spring que te permite interceptar requests **antes** de que lleguen al controller. Podés elegir exactamente qué rutas aplicar (`addPathPatterns`) y cuáles excluir (`excludePathPatterns`).

### Archivos necesarios

### 1. Interceptor

```java
package com.arielzarate.products.infraestructure.rest.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class ApiKeyInterceptor implements HandlerInterceptor {

    private final String expectedApiKey;
    private final String expectedDeviceId;

    public ApiKeyInterceptor(
            @Value("${api.key}") String expectedApiKey,
            @Value("${api.device-id}") String expectedDeviceId
    ) {
        this.expectedApiKey = expectedApiKey;
        this.expectedDeviceId = expectedDeviceId;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        String apiKey = request.getHeader("X-Middleware-ApiKey");
        String deviceId = request.getHeader("X-Middleware-DeviceId");

        if (!expectedApiKey.equals(apiKey) || !expectedDeviceId.equals(deviceId)) {
            response.setStatus(401);
            response.setContentType("application/json");
            response.getWriter().write("""
                {"error": "Unauthorized", "message": "Invalid or missing API Key headers"}
                """.stripIndent());
            return false;
        }

        return true;
    }
}
```

### 2. WebConfig (registrar el interceptor)

```java
package com.arielzarate.products.infraestructure.rest.config;

import com.arielzarate.products.infraestructure.rest.interceptor.ApiKeyInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final ApiKeyInterceptor apiKeyInterceptor;

    public WebConfig(ApiKeyInterceptor apiKeyInterceptor) {
        this.apiKeyInterceptor = apiKeyInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(apiKeyInterceptor)
                .addPathPatterns("/api/**");       // protege TODO /api/
                //.excludePathPatterns("/api/actuator/health"); // si querés excluir algo
    }
}
```

### 3. Variables en application.yaml

```yaml
api:
  key: idApp1237897key
  device-id: idDevice321567Device
```

### Ventajas

| Aspecto | Detalle |
|---------|---------|
| **Control fino** | Elegís qué paths proteger con `addPathPatterns` y cuáles excluir con `excludePathPatterns` |
| **Acceso al handler** | Tenés el objeto `HandlerMethod` si necesitás saber qué controller/método se va a ejecutar |
| **PostHandle/AfterCompletion** | Podés agregar lógica después del controller o después de la respuesta |
| **Inyección de propiedades** | Usás `@Value` o constructor injection para leer las credenciales |
| **Testing** | Fácil de mockear en tests de integración |

### Desventajas

| Aspecto | Detalle |
|---------|---------|
| **Un paso más** | Necesitás el interceptor + el WebConfig para registrarlo |
| **Solo Spring MVC** | No funciona con WebFlux (si usaras WebFlux, necesitás otra cosa) |

---

## Opción 2 — OncePerRequestFilter

### ¿Qué es?

`OncePerRequestFilter` es una clase abstracta de Spring que se ejecuta **una vez por request**. Es más bajo nivel que HandlerInterceptor (trabaja a nivel Servlet, no a nivel Spring MVC).

### Archivo único

```java
package com.arielzarate.products.infraestructure.rest.interceptor;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(1)
public class ApiKeyFilter extends OncePerRequestFilter {

    private final String expectedApiKey;
    private final String expectedDeviceId;

    public ApiKeyFilter(
            @Value("${api.key}") String expectedApiKey,
            @Value("${api.device-id}") String expectedDeviceId
    ) {
        this.expectedApiKey = expectedApiKey;
        this.expectedDeviceId = expectedDeviceId;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Excluir paths públicos
        if (path.startsWith("/api/actuator/") || path.equals("/api/swagger-ui.html")) {
            filterChain.doFilter(request, response);
            return;
        }

        String apiKey = request.getHeader("X-Middleware-ApiKey");
        String deviceId = request.getHeader("X-Middleware-DeviceId");

        if (!expectedApiKey.equals(apiKey) || !expectedDeviceId.equals(deviceId)) {
            response.setStatus(401);
            response.setContentType("application/json");
            response.getWriter().write("""
                {"error": "Unauthorized", "message": "Invalid or missing API Key headers"}
                """.stripIndent());
            return;
        }

        filterChain.doFilter(request, response);
    }
}
```

**Nota:** en la Opción 2 las exclusiones de paths se manejan **dentro del filtro** con `if` en vez de con `excludePathPatterns`.

### Ventajas

| Aspecto | Detalle |
|---------|---------|
| **Un solo archivo** | No necesitás un WebConfig aparte |
| **Garantía de una vez** | Spring garantiza que se ejecuta una sola vez por request (vs. `Filter` genérico que podría ejecutarse múltiples veces) |
| **Independiente de Spring MVC** | Funciona con cualquier framework basado en Servlet |

### Desventajas

| Aspecto | Detalle |
|---------|---------|
| **Paths hardcodeados** | Las exclusiones van con `if` dentro del código, no tan declarativo como `excludePathPatterns` |
| **No sabés qué handler** | No tenés acceso al `HandlerMethod`, solo al request raw |
| **Menos control** | Se ejecuta antes de que Spring resuelva el handler, así que no podés tomar decisiones basadas en el controller/método destino |

---

## Comparación rápida

| Aspecto | HandlerInterceptor (Op 1) | OncePerRequestFilter (Op 2) |
|---------|---------------------------|----------------------------|
| Archivos | Interceptor + WebConfig | Un solo filtro |
| Control de paths | `addPathPatterns` / `excludePathPatterns` | `if` en el código |
| Acceso al handler | ✅ Sí (HandlerMethod) | ❌ No |
| Nivel | Spring MVC | Servlet |
| Complejidad | Baja | Muy baja |
| Testing | Fácil (mock interceptor) | Fácil (mock filter) |

---

## Recomendación

Usar **Opción 1 (HandlerInterceptor)** porque:

- Podés definir los paths protegidos de forma declarativa con `addPathPatterns` (ej: `/api/products/**`, `/api/category/**`)
- Si mañana agregás un endpoint público, solo lo excluís en el `WebConfig`
- No mezclás lógica de rutas con lógica de validación

### Ubicación en el proyecto

```
products-service/
└── src/main/java/com/arielzarate/products/
    └── infraestructure/
        └── rest/
            ├── config/
            │   ├── WebClientConfig.java        ← ya existe
            │   └── WebConfig.java              ← nuevo (registra el interceptor)
            ├── interceptor/
            │   └── ApiKeyInterceptor.java      ← nuevo
            └── ...resto
```

### application.yaml

```yaml
external:
  api-key: idApp1237897key
  device-id: idDevice321567Device
```

### .env (para desarrollo local)

```
API_KEY=idApp1237897key
DEVICE_ID=idDevice321567Device
```

---

## Implementación final en products-service

**Archivo:** `com.arielzarate.products.interfaces.middleware.HeaderFilter.java`

```java
@Component
public class HeaderFilter extends OncePerRequestFilter {
    @Value("${external.api-key}")
    private String apiKey;

    @Value("${external.device-id}")
    private String deviceId;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Endpoints públicos de infraestructura
        if (path.startsWith("/api/swagger-ui") ||
                path.startsWith("/api/api-docs") ||
                path.startsWith("/api/actuator/") ||
                path.equals("/api/") || path.equals("/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Endpoints públicos GET de Products y Categories
        if ("GET".equals(method)) {
            boolean isPublicProduct = path.matches("/api/products(/\\\\d+)?");
            boolean isPublicCategory = path.matches("/api/category(/\\\\d+)?");
            if (isPublicProduct || isPublicCategory) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        // Protegido: validar API Key
        String requestApiKey = request.getHeader("X-Middleware-ApiKey");
        String requestDeviceId = request.getHeader("X-Middleware-DeviceId");

        if (!apiKey.equals(requestApiKey) || !deviceId.equals(requestDeviceId)) {
            response.setStatus(401);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Unauthorized\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
```

### Reglas de acceso

| Endpoint | Método | Acceso |
|---|---|---|
| `/api/products` | GET | ✅ Público |
| `/api/products/{id}` | GET | ✅ Público |
| `/api/products` | POST | 🔐 API Key |
| `/api/products/{id}` | PUT | 🔐 API Key |
| `/api/products/{id}` | DELETE | 🔐 API Key |
| `/api/products/{id}/activate` | POST | 🔐 API Key |
| `/api/category` | GET | ✅ Público |
| `/api/category/{id}` | GET | ✅ Público |
| `/api/category` | POST | 🔐 API Key |
| `/api/category/{id}` | PUT | 🔐 API Key |
| `/api/category/{id}` | DELETE | 🔐 API Key |
| `/api/category/{id}/activate` | POST | 🔐 API Key |
