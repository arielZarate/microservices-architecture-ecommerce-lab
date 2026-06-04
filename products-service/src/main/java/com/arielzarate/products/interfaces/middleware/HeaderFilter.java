package com.arielzarate.products.interfaces.middleware;

import com.arielzarate.products.interfaces.middleware.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class HeaderFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Value("${external.api-key}")
    private String apiKey;

    @Value("${external.device-id}")
    private String deviceId;

    public HeaderFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, @NonNull HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        log.info("Request: {} {}", method, path);

        //url publics (swagger, actuator, GET products, GET category)
        if (isPublicPath(path, method)) {
            log.info("Public path - access granted");
            filterChain.doFilter(request, response);
            return;
        }

        // 1️⃣ Try JWT first (validar Bearer token)
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.isValid(token)) {
                log.info("JWT authentication successful - access granted");
                filterChain.doFilter(request, response);
                return;
            }
            log.warn("JWT token invalid - trying API Key");
        }

        // 2️⃣ Try API Key second (comunicación entre microservicios)
        String requestApiKey = request.getHeader("X-Middleware-ApiKey");
        String requestDeviceId = request.getHeader("X-Middleware-DeviceId");
        if (apiKey.equals(requestApiKey) && deviceId.equals(requestDeviceId)) {
            log.info("API Key authentication successful - access granted");
            filterChain.doFilter(request, response);
            return;
        }

        // 3️⃣ Nothing worked → 401
        unauthorized(response, method, path);
    }


    private void unauthorized(HttpServletResponse response, String method, String path) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Invalid or missing JWT token or API Key\"}");

        log.warn("Unauthorized access {} - no valid JWT or API Key provided", path);
    }

    private boolean isPublicPath(String path, String method) {
        // Infraestructura pública (swagger, actuator)
        if (path.startsWith("/api/swagger-ui")
                || path.startsWith("/api/api-docs")
                || path.startsWith("/api/actuator/")
                || path.equals("/")
                || path.equals("/api/")) {
            return true;
        }

        // GET públicos de Products y Category
        if ("GET".equals(method)) {
            return path.matches("/api/products(/\\d+)?")
                    || path.matches("/api/category(/\\d+)?");
        }

        return false;
    }
}
