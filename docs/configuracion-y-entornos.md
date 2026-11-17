# Configuración y entornos — Fase 2.5

> Documento de referencia. Recoge el análisis y las decisiones sobre cómo se
> configura el sistema en dev, Docker Compose y Kubernetes.
>
> Estado: **borrador / propuesta** (previo a implementar).
> Última actualización: 2026-11-17.

---

## 1. Resumen (TL;DR)

- **Compose y Kubernetes no son configuración**: son orquestación. No deben
  contener secretos ni decidir qué usa cada servicio.
- **La misma imagen/jar corre en cualquier entorno.** Lo que cambia se inyecta
  desde afuera (variables de entorno).
- **YAML** = comportamiento no sensible (puertos, timeouts, serializers,
  `ddl-auto`). **Env** = secretos y todo lo que depende del entorno.
- **Java**: `application.yaml` + `application-dev.yaml` + `application-prod.yaml`
  (base + perfiles). **Node**: sin yaml, solo env + validación al arrancar.
- **`.env` raíz** = variables compartidas. **`.env` de cada servicio** = solo
  las propias. Ninguna clave se repite entre ambos.
- **Kubernetes**: `ConfigMap` por servicio (propias) + **un** `Secret`
  compartido (`ecommerce-secrets`). El `.env` no "se sube": se traduce.
- Hoy hay un agujero real: **`products-service` no recibe los secretos en el
  compose** y valida con los valores commiteados en su `application.yaml`.

---

## 2. El problema: dos conceptos mezclados

| Concepto | Quién lo hace | En el proyecto |
|---|---|---|
| **Orquestación / despliegue** | Compose en local, K8s en prod | `docker-compose.yml`, manifests |
| **Configuración de la aplicación** | La app misma | `application.yaml`, `.env` |

Hoy los secretos viven en **tres capas a la vez**, lo que genera ambigüedad
sobre cuál es la fuente de verdad:

1. Defaults hardcodeados en `docker-compose.yml`.
2. `.env` de `order-service` y `user-service` (gitignoreados).
3. `application.yaml` de `products-service` y `shipment-service`
   (**commiteados en Git**).

---

## 3. Regla de oro (12-factor)

> La misma imagen corre en cualquier entorno. Lo que cambia se inyecta desde
> afuera.

Consecuencia práctica: **si tenés que rebuildear para prod, la configuración
está mal ubicada**. Y **un secreto que está en un yaml dentro del jar no es un
secreto**.

---

## 4. Estado actual

### 4.1 Dónde vive cada cosa

| Dónde | Qué contiene | Problema |
|---|---|---|
| `docker-compose.yml` | `POSTGRES_PASSWORD:-admin`, `JWT_SECRET:-...`, `API_KEY:-...`, `DEVICE_ID:-...` | Secretos con default, commiteados |
| `order-service/.env` | Todo: DB, Kafka, JWT, API Key, timeout | Duplica el contrato |
| `user-service/.env` | Todo: DB, JWT, API Key | Duplica el contrato |
| `products-service/application.yaml` | `jwt.secret`, `external.api-key`, `external.device-id` | **Secretos en Git** |
| `shipment-service/application.yaml` | `external.api-key`, `external.device-id`, datasource `postgres/admin` | **Secretos en Git** |

### 4.2 El agujero concreto

En `docker-compose.yml`, `products-service` **solo** recibe:

```yaml
SPRING_DATASOURCE_URL / SPRING_DATASOURCE_USERNAME / SPRING_DATASOURCE_PASSWORD
```

No recibe `JWT_SECRET`, `API_KEY` ni `DEVICE_ID`. Por lo tanto valida los JWT y
la API Key con los valores **hardcodeados en el yaml versionado**.

**Efecto:** si se cambia `JWT_SECRET` en un `.env` raíz, `user` firma con el
nuevo, `order` valida con el nuevo… y `products` **rechaza todos los tokens**
porque sigue con el viejo. Compose *parece* la fuente de verdad, pero no lo es.

### 4.3 Cómo carga la config cada runtime (hoy)

| Servicio | Mecanismo |
|---|---|
| `user-service` | `import 'dotenv/config'` en `src/server.ts` → lee `.env` del CWD |
| `order-service` | idem, más `src/lib/prisma.ts` y `prisma.config.ts` |
| `products-service` | Spring: `application.yaml` + overrides por env de Compose |
| `shipment-service` | idem |

En contenedor no se copia el `.env` (correcto, ya es 12-factor). En local sí se
necesita para `npm run dev` / `mvnw spring-boot:run`.

---

## 5. Inventario de variables

### 5.1 Compartidas — contrato entre servicios

Tienen que ser **idénticas en todos**. Si cambian en uno solo, el flujo se rompe.

| Variable | `user` | `order` | `products` | `shipment` |
|---|---|---|---|---|
| `JWT_SECRET` | firma | valida | valida | — |
| `API_KEY` | valida | valida + envía | valida | envía |
| `DEVICE_ID` | valida | valida + envía | valida | envía |
| `POSTGRES_PASSWORD` | DB | DB | DB | DB |

### 5.2 Propias de cada servicio

No se unifican: cada servicio las define y puede cambiarlas sin afectar a los
demás.

| Servicio | Propias |
|---|---|
| `user-service` | `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_NAME`, `DATABASE_URL` (Prisma CLI) |
| `order-service` | `PORT`, `DB_*`, `DATABASE_URL`, `KAFKA_BROKER`, `KAFKA_GROUP_ID`, `PRODUCT_SERVICE_URL`, `TIMEOUT` |
| `products-service` | `server.port`, `spring.datasource.*`, `springdoc.*`, `spring.jpa.*` |
| `shipment-service` | `server.port`, `spring.datasource.*`, `spring.kafka.*`, `externals.*`, `scheduled.*` |

### 5.3 Mapa de nombres

| Concepto | Clave canónica (Secret) | Nombre que consume el servicio |
|---|---|---|
| Secreto JWT | `JWT_SECRET` | `JWT_SECRET` (Node) / `jwt.secret: ${JWT_SECRET}` (Spring) |
| API Key interna | `API_KEY` | `API_KEY` |
| Device ID interno | `DEVICE_ID` | `DEVICE_ID` |
| Password de Postgres | `POSTGRES_PASSWORD` | `DB_PASSWORD` (Node) / `spring.datasource.password` |

> El renombre `POSTGRES_PASSWORD` → `DB_PASSWORD` es trivial tanto en Compose
> (`DB_PASSWORD: ${POSTGRES_PASSWORD:?...}`) como en K8s
> (`secretKeyRef: { key: POSTGRES_PASSWORD }` con `name: DB_PASSWORD`).

---

## 6. Modelo objetivo por entorno

| Entorno | Propias | Compartidas | Activa |
|---|---|---|---|
| Dev local (`npm run dev` / `mvnw spring-boot:run`) | `.env` del servicio | `.env` raíz | perfil `dev` |
| Docker Compose | `environment:` del servicio | `.env` raíz, **sin defaults** | `SPRING_PROFILES_ACTIVE=dev` |
| Kubernetes | `ConfigMap/<servicio>-config` | `Secret/ecommerce-secrets` | `SPRING_PROFILES_ACTIVE=prod` |

### 6.1 Estructura de archivos propuesta

```
.env                          # raíz: SOLO compartidas (gitignoreado)
.env.example                  # mismas claves, valores dummy (versionado)
docker-compose.yml            # orquestación local, sin defaults de secretos

order-service/
  .env                        # SOLO propias
  .env.example
user-service/
  .env                        # SOLO propias
  .env.example

products-service/src/main/resources/
  application.yaml            # común, sin secretos ni hosts
  application-dev.yaml        # localhost + importa ../.env
  application-prod.yaml       # forma de prod, sin secretos
shipment-service/src/main/resources/
  application.yaml
  application-dev.yaml
  application-prod.yaml

k8s/                          # Fase 3
  products-service/configmap.yaml
  shipment-service/configmap.yaml
  order-service/configmap.yaml
  user-service/configmap.yaml
  secrets/sealed-secret.yaml  # cifrado, versionable
```

**Regla de no solapamiento:** ninguna clave aparece a la vez en el `.env` raíz y
en el `.env` del servicio. Raíz = compartidas, servicio = propias. Así no hay
ambigüedad de precedencia ni drift.

---

## 7. YAML de Spring: base + perfiles

### `application.yaml` (común, versionado, sin secretos)

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  application:
    name: products-service
  profiles:
    default: dev                 # mvnw spring-boot:run → dev sin flags
  datasource:
    username: ${DB_USER:postgres}
    password: ${POSTGRES_PASSWORD}   # sin default → falla si falta
  jpa:
    hibernate:
      ddl-auto: ${DDL_AUTO:update}

external:
  api-key: ${API_KEY}
  device-id: ${DEVICE_ID}

jwt:
  secret: ${JWT_SECRET}

springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html

management:
  endpoints:
    web:
      exposure:
        include: health,info
```

### `application-dev.yaml` (local)

```yaml
spring:
  config:
    import: optional:file:../.env[.properties]   # reusa el .env raíz
  datasource:
    url: jdbc:postgresql://localhost:5432/products_management
  jpa:
    show-sql: true
```

### `application-prod.yaml` (forma de prod)

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}   # lo inyecta el ConfigMap/env
  jpa:
    hibernate:
      ddl-auto: validate            # o Flyway en el futuro
    show-sql: false

logging:
  level:
    root: INFO
```

> `application-prod.yaml` **no** contiene secretos ni hosts: llegan por env.
> El perfil se activa con `SPRING_PROFILES_ACTIVE=prod`.

### Cómo se cargan las variables en cada entorno (Spring)

| Entorno | Cómo llega `JWT_SECRET` |
|---|---|
| Dev | `application-dev.yaml` importa `../.env` como properties |
| Compose | `environment:` del servicio |
| K8s | `envFrom.secretRef` |

Precedencia de Spring (de menor a mayor): defaults del código → `application.yaml`
→ `application-{perfil}.yaml` → variables de entorno → argumentos CLI.

---

## 8. Node: sin yaml, con validación

Los servicios Node ya son 12-factor puro (`process.env`). Lo que falta:

1. **Cargar el `.env` raíz además del propio.** Con `dotenv` (ya instalado):

   ```ts
   import { config } from 'dotenv';
   config({ path: ['../.env', '.env'] });   // raíz + propias
   ```

   Como no hay claves repetidas, el orden de precedencia es irrelevante.

2. **Validar al arrancar (fail-fast).** Si falta una variable crítica, el
   proceso debe morir con un mensaje claro en vez de fallar raro después
   (ej. `JWT_SECRET` `undefined` → todos los tokens inválidos).

   ```ts
   const required = ['JWT_SECRET', 'API_KEY', 'DEVICE_ID', 'DB_HOST', 'DB_NAME'];
   const missing = required.filter((k) => !process.env[k]);
   if (missing.length) {
     throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
   }
   ```

   Opcional: usar `zod` para validar tipos (puertos numéricos, URLs).

---

## 9. Kubernetes (Fase 3)

### 9.1 ConfigMap vs Secret

| Objeto | Para qué | Ejemplo |
|---|---|---|
| **`ConfigMap`** | Datos **no sensibles** | `PORT`, `DB_NAME`, `KAFKA_GROUP_ID`, `PRODUCT_SERVICE_URL` |
| **`Secret`** | Datos **sensibles** | `JWT_SECRET`, `API_KEY`, `DEVICE_ID`, `POSTGRES_PASSWORD` |

Un ConfigMap está en texto plano y lo lee cualquiera con acceso al namespace. Un
Secret también es base64 (no cifrado por defecto), pero se puede cifrar en
reposo, aplicar RBAC y no aparece en `kubectl describe`.

**Regla:** si no lo subirías a Git, es `Secret`.

### 9.2 Convención de nombres

| Recurso | Nombre |
|---|---|
| Namespace | `lab` |
| ConfigMap por servicio | `<servicio>-config` → `order-service-config` |
| Secret compartido | `ecommerce-secrets` |

**Un ConfigMap por servicio** (cada uno tiene variables propias distintas) y
**un solo Secret compartido** (las 4 variables son idénticas en los 4 servicios).

### 9.3 Ejemplo: ConfigMap de `order-service`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: order-service-config
  namespace: lab
data:
  PORT: "3000"
  DB_HOST: "postgres"
  DB_PORT: "5432"
  DB_NAME: "orders_management"
  DB_USER: "postgres"
  KAFKA_BROKER: "kafka:9092"
  KAFKA_GROUP_ID: "order-service-group"
  PRODUCT_SERVICE_URL: "http://products-service:8080/api"
```

### 9.4 Ejemplo: Secret compartido

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ecommerce-secrets
  namespace: lab
type: Opaque
stringData:
  JWT_SECRET: "..."
  API_KEY: "..."
  DEVICE_ID: "..."
  POSTGRES_PASSWORD: "..."
```

> No commitear este archivo en claro. Para GitOps usar **Sealed Secrets** o
> **External Secrets** (Fase 7).

### 9.5 Consumo desde el pod

```yaml
envFrom:
  - configMapRef: { name: order-service-config }
  - secretRef:    { name: ecommerce-secrets }
env:
  - name: DB_PASSWORD            # renombrar es trivial
    valueFrom:
      secretKeyRef:
        name: ecommerce-secrets
        key: POSTGRES_PASSWORD
  - name: SPRING_PROFILES_ACTIVE
    value: "prod"
```

### 9.6 Cómo se crea el Secret

El `.env` **no se "sube"** a Kubernetes. Se traduce:

```bash
# Opción rápida (manual)
kubectl create secret generic ecommerce-secrets \
  --from-env-file=.env -n lab

# Opción GitOps (recomendada, Fase 7)
kubeseal --format yaml < secret.yaml > sealed-secret.yaml
# ArgoCD reconcilia sealed-secret.yaml; el valor real nunca se commitea
```

---

## 10. Trampas conocidas

1. **Comillas en el `.env`.** `JWT_SECRET="abc"` — `dotenv` las quita, pero
   Spring leyendo el archivo como `properties` **las deja** y el JWT deja de
   validar. Usar valores **sin comillas**.
2. **`products-service` sin secretos en Compose.** Hoy valida con los valores
   commiteados en el yaml. Hay que inyectarle `JWT_SECRET`, `API_KEY` y
   `DEVICE_ID`.
3. **Naming inconsistente en Spring.** `shipment` usa `EXTERNAL_API_KEY` para
   `external.api-key`. Unificar a las claves canónicas (`API_KEY`,
   `DEVICE_ID`) para que un solo Secret sirva a los 4 pods.
4. **Fail-fast, no defaults.** `${JWT_SECRET}` sin valor por defecto. Un default
   silencioso en un secreto es peor que un crash al arrancar.
5. **Rotación de `JWT_SECRET`.** Cambiarlo invalida todos los tokens emitidos:
   hay que volver a loguearse. Avisar en el commit.
6. **`TIMEOUT`** existe en `order-service/.env` pero no está documentado en el
   README principal.

---

## 11. Plan de ejecución (checklist)

### A. Archivos nuevos

- [ ] `.env` raíz — solo `JWT_SECRET`, `API_KEY`, `DEVICE_ID`,
      `POSTGRES_PASSWORD` (+ `POSTGRES_USER`), sin comillas.
- [ ] `.env.example` raíz — mismas claves, valores dummy.
- [ ] `order-service/.env.example` y `user-service/.env.example` — solo sus
      propias variables.

### B. `docker-compose.yml`

- [ ] Quitar defaults de secretos: `${JWT_SECRET:?falta en .env}`,
      `${API_KEY:?...}`, `${DEVICE_ID:?...}`, `${POSTGRES_PASSWORD:?...}`.
- [ ] Inyectar en `products-service`: `JWT_SECRET`, `API_KEY`, `DEVICE_ID`
      (vía claves canónicas).
- [ ] Normalizar `shipment-service`: `EXTERNAL_API_KEY` → `API_KEY`,
      `EXTERNAL_DEVICE_ID` → `DEVICE_ID`.
- [ ] Agregar `SPRING_PROFILES_ACTIVE=dev` a `products` y `shipment`.
- [ ] Mantener defaults solo para lo no sensible (`POSTGRES_USER`, puertos).

### C. `application.yaml` de `products` y `shipment`

- [ ] Mover hosts/credenciales a `${VARIABLE}` sin default.
- [ ] Crear `application-dev.yaml` con `localhost` + `spring.config.import`.
- [ ] Crear `application-prod.yaml` sin secretos.
- [ ] Agregar `spring.profiles.default: dev`.

### D. Node (`order`, `user`)

- [ ] Reemplazar `import 'dotenv/config'` por
      `config({ path: ['../.env', '.env'] })`.
- [ ] Agregar validación fail-fast de variables requeridas.

### E. Documentación

- [ ] Enlazar este documento desde `README.md`.
- [ ] Actualizar la sección "Fase 2.5" del README con las decisiones tomadas.

---

## 12. Validación / criterios de aceptación

1. `docker compose config` interpolа bien y **falla** si falta una variable
   requerida en el `.env`.
2. `git grep -n "sapee2026\|idApp1237897key\|idDevice321567Device"` no devuelve
   nada fuera de `.env.example` (valores dummy).
3. Los 4 servicios arrancan en Compose y responden `/health` / `/actuator/health`.
4. E2E completo: login → crear orden → `PUT PAID` → `PREPARING` → `SHIPPED` →
   `DELIVERED` (mismo flujo validado el 2026-11-05).
5. En dev local, `npm run dev` y `mvnw spring-boot:run` arrancan sin exportar
   variables a mano.
6. Cambiar `JWT_SECRET` en el `.env` raíz y reiniciar **no** rompe `products`.

---

## 13. Decisiones

| # | Decisión | Estado |
|---|---|---|
| A | `.env` raíz para compartidas + `.env` por servicio para propias | **Propuesta** |
| B | Quitar defaults de secretos (fail-fast) | **Propuesta** |
| C | Implementar Fase 2.5 antes de la Fase 3 (K8s) | **Propuesta** |
| D | Java por perfiles (`dev`/`prod`), Node solo env | **Propuesta** |
| E | Un Secret compartido + ConfigMap por servicio en K8s | **Propuesta** |

> Pendiente de confirmación antes de tocar código.
