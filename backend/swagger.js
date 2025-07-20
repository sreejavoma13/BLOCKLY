import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Project API',
      version: '1.0.0',
      description: 'API documentation for Express + Firebase app',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local server',
      },
    ],
  },
  apis: [path.resolve('./swagger.yaml')], // Points to your YAML file
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
