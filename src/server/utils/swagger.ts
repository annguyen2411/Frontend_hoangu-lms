import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HoaNgữ LMS API',
      version: '1.0.0',
      description: 'API Documentation for HoaNgữ - Chinese Language Learning Platform',
      contact: {
        name: 'API Support',
        email: 'support@hoangu.tech',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development Server',
      },
      {
        url: 'https://api.hoangu.tech/api',
        description: 'Production Server',
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
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            full_name: { type: 'string' },
            role: { type: 'string', enum: ['student', 'instructor', 'admin', 'super_admin'] },
            avatar_url: { type: 'string' },
            level: { type: 'integer' },
            xp: { type: 'integer' },
            coins: { type: 'integer' },
          },
        },
        Course: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            thumbnail_url: { type: 'string' },
            price_vnd: { type: 'integer' },
            level: { type: 'string' },
            category: { type: 'string' },
            is_published: { type: 'boolean' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./routes/*.ts'],
};

export const specs = swaggerJsdoc(options);
export const swaggerRouter = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'HoaNgữ LMS API Docs',
});
