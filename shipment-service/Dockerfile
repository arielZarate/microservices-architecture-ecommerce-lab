# syntax=docker/dockerfile:1

# ==============================================================================
# ETAPA 1 - BUILD
# Compila Kotlin/Maven dentro de la imagen (no se usa el target/ del host) y
# separa el jar en capas para que el runtime cachee dependencias.
# ==============================================================================
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /build

# Wrapper + pom primero: si solo cambia el código, esta capa se reutiliza.
COPY --chmod=0755 mvnw mvnw
COPY .mvn/ .mvn/
COPY pom.xml .

RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -B -ntp dependency:go-offline

COPY src/ src/

RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -B -ntp package -DskipTests

# Capas: dependencies / spring-boot-loader / snapshot-dependencies / application
RUN java -Djarmode=tools -jar target/shipment-service-0.0.1-SNAPSHOT.jar \
    extract --layers --launcher --destination target/extracted

# ==============================================================================
# ETAPA 2 - RUNTIME
# Solo JRE + capas extraídas. Usuario no root.
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# -D = sin contraseña, -H = sin home, -u 10001, -s = shell nologin (Alpine)
RUN adduser -D -H -u 10001 -s /sbin/nologin appuser

COPY --from=build /build/target/extracted/dependencies/ ./
COPY --from=build /build/target/extracted/spring-boot-loader/ ./
COPY --from=build /build/target/extracted/snapshot-dependencies/ ./
COPY --from=build /build/target/extracted/application/ ./

USER appuser

# server.port de application.yaml
EXPOSE 8081

# Sobreescribible: docker run -e JAVA_TOOL_OPTIONS="-Xmx256m"
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0"

# Con capas extraídas no hay app.jar: arranca el launcher de Spring Boot
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
