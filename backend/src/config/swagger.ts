import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import config from './config';

// Swagger tanımlaması
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Ticaret API',
      version: '1.0.0',
      description: 'E-Ticaret platformu için RESTful API dokümantasyonu',
      contact: {
        name: 'API Desteği',
        email: 'info@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Geliştirme sunucusu',
      },
      {
        url: 'https://ecommerce-site-backend-mu.vercel.app',
        description: 'Canlı (Vercel)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Rota dosyalarının yolu
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Express uygulamasına Swagger UI'ı ekleyen fonksiyon
export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Swagger JSON endpoint'i
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log(`Swagger UI kullanılabilir: http://localhost:${config.port}/api-docs`);
  console.log('Swagger UI (Canlı): https://ecommerce-site-backend-mu.vercel.app/api-docs');
};
