import swaggerJSDoc from "swagger-jsdoc";

const swagerSpec=swaggerJSDoc({
    definition: {
    openapi: "3.0.0",
    info: {
      title: "Order Service API",
      version: "1.0.0",
      description:'Microservice management orders'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        OrderResponse: {
          type: 'object',
          properties: {
            orderId: { type: 'string', format: 'uuid' },
            totalAmount: { type: 'number' },
            status: { type: 'string', enum: ['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'CANCELLED'] },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  productId: { type: 'integer' },
                  productName: { type: 'string' },
                  quantity: { type: 'integer' },
                  unitPrice: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.ts"],
})


export default swagerSpec;