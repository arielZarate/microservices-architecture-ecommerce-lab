# Order Service

Microservicio de gestión de órdenes para el e-commerce.

## Descripción

Este servicio:
- Gestiona órdenes (creación, listado, actualización de estado)
- Estados: PENDING, PAID, PREPARING, SHIPPED
- Se comunica con product-service via HTTP (Axios)
- Persiste en PostgreSQL con Prisma ORM
- Autenticación JWT (pendiente)

## Tech Stack

- **Node.js** + **Express** + **TypeScript**
- **Prisma** ORM
- **PostgreSQL**
- **Axios** (comunicación con product-service)
- **dotenv** (variables de entorno)
- **morgan** (logging)
- **cors** (CORS)

## Estructura del proyecto

```
order-service/
├── src/
│   ├── app.ts                    # Configuración Express
│   ├── server.ts                 # Entry point
│   ├── routes/
│   │   ├── index.route.ts        # Rutas principales
│   │   └── order.route.ts        # Rutas de orders
│   └── middlewares/
│       └── errorHandler.ts       # Manejo de errores
├── .env                          # Variables de entorno
├── tsconfig.json                 # Configuración TypeScript
├── package.json
└── README.md
```

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/` | Mensaje raíz |
| GET | `/api/orders` | Listar todas las órdenes |
| GET | `/api/orders/:id` | Obtener orden por ID |
| POST | `/api/orders` | Crear nueva orden |
| PUT | `/api/orders/:id/status` | Actualizar estado de orden |
| DELETE | `/api/orders/:id` | Eliminar orden (soft delete) |

## Estados de Orden

- **PENDING** - Orden creada, esperando pago
- **PAID** - Pago confirmado
- **PREPARING** - Preparando envío
- **SHIPPED** - Enviada

## Manejo de Errores

### Estructura de respuesta de error

```json
{
  "error": {
    "type": "ErrorType",
    "title": "Mensaje de error",
    "status": 404
  }
}
```

### Clases disponibles

- **HttpError**: Lanzar errores con código HTTP
  ```ts
  throw new HttpError('Orden no encontrada', 404);
  ```

- **errorHandler**: Middleware que captura errores (usado por Express)
- **notFoundHandler**: Middleware para rutas no encontradas

## Configuración

### Variables de entorno (.env)

```env
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/orders_db
PRODUCT_SERVICE_URL=http://localhost:8080/api
```

### Puerto

- **Default:** 3000
- **Configurable** via variable `PORT`

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar en modo desarrollo (tsx --watch) |
| `npm run build` | Compilar TypeScript |
| `npm run start` | Iniciar producción (node dist/server.js) |

## Estado actual

- ✅ Setup básico (Express, TypeScript, dotenv)
- ✅ Configuración tsconfig
- ✅ Middlewares (cors, morgan, json)
- ✅ Rutas configuradas (index, orders)
- ✅ Error handler centralizado
- ⏳ Prisma setup (pendiente)
- ⏳ Modelos de datos (pendiente)
- ⏳ Implementación endpoints (pendiente)
- ⏳ Conexión product-service (pendiente)
- ⏳ JWT middleware (pendiente)

## Próximos pasos

1. Instalar Prisma (`npm install @prisma/client`, `npm install -D prisma`)
2. Crear schema.prisma con modelos Order, OrderItem
3. Implementar lógica de endpoints
4. Conectar con product-service
5. Agregar JWT

---

**Autor:** Ariel Zarate
**Email:** arieltecnico@gmail.com