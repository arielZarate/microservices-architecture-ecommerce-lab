

################################################################################

# Descargar dependencias
FROM eclipse-temurin:21-jdk-alpine as download
WORKDIR /build
# Copy the mvnw wrapper with executable permissions.
COPY --chmod=0755 mvnw mvnw
COPY .mvn/ .mvn/

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.m2 so that subsequent builds don't have to
# re-download packages.
RUN --mount=type=bind,source=pom.xml,target=pom.xml \
    --mount=type=cache,target=/root/.m2 ./mvnw dependency:go-offline -DskipTests

################################################################################

FROM download as package
WORKDIR /build
COPY ./src src/
RUN --mount=type=bind,source=pom.xml,target=pom.xml \
    --mount=type=cache,target=/root/.m2 \
    ./mvnw package -DskipTests && \
    mv target/$(./mvnw help:evaluate -Dexpression=project.artifactId -q -DforceStdout)-$(./mvnw help:evaluate -Dexpression=project.version -q -DforceStdout).jar target/app.jar

################################################################################

FROM package as extract

WORKDIR /build

RUN java -Djarmode=tools -jar target/app.jar extract --layers --destination target/extracted

################################################################################



FROM eclipse-temurin:21-jre-alpine AS final
ARG UID=10001

    #  -D = no asignar contraseña (en Alpine es obligatorio)
    #  -H = no crear el home
    #  -u "${UID}" = UID 10001 (igual que antes)
    #  -s /sbin/nologin = shell de nologin (igual que antes)

RUN adduser \
    -D \
    -H \
    -u "${UID}" \
    -s  /sbin/nologin \
    appuser

USER appuser


COPY --from=extract build/target/extracted/dependencies/ ./
COPY --from=extract build/target/extracted/spring-boot-loader/ ./
COPY --from=extract build/target/extracted/snapshot-dependencies/ ./
COPY --from=extract build/target/extracted/application/ ./

EXPOSE 8080

ENTRYPOINT [ "java", "-jar", "app.jar" ]
