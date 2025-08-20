import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Akıllı Sera Yönetim Sistemi API",
      version: "1.0.0",
      description: "REST API dokümantasyonu",
    },
    servers: [
      { url: "/api", description: "Base path (server.ts'te /api mount edildi)" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            code: { type: "number" },
            data: {},
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            code: { type: "number" },
            error: {
              type: "object",
              properties: {
                message: { type: "string" },
                description: { type: "string" },
              },
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            access_token: { type: "string" },
          },
        },
        Greenhouse: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            location: { type: "string" },
            user_id: { type: "integer" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Zone: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            greenhouse_id: { type: "integer" },
          },
        },
        Sensor: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            type: { type: "string", enum: ["temperature","humidity","soil_moisture","light_level","ph","co2"] },
            zone_id: { type: "integer" },
            status: { type: "string", enum: ["active","inactive","maintenance","error"] },
            location: { type: "string" },
          },
        },
        SensorReading: {
          type: "object",
          properties: {
            id: { type: "integer" },
            sensor_id: { type: "integer" },
            value: { type: "number" },
            unit: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
            is_anomaly: { type: "boolean" },
            anomaly_score: { type: "number", nullable: true },
          },
        },
      },
    },
  },
  apis: ["src/routes/**/*.ts"], // JSDoc açıklamalarını bu dosyalardan okuyacak
};

export const swaggerSpec = swaggerJSDoc(options);