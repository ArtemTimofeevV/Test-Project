import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const PORT = 3000;

const SWAGGER_OPTIONS = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'API for E-commerce application',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/entities/*.ts'],
};

const SWAGGER_DOCS = swaggerJsdoc(SWAGGER_OPTIONS);

export const setupSwagger = (APP: Express) => {
  APP.use('/api-docs', swaggerUi.serve, swaggerUi.setup(SWAGGER_DOCS));
};
