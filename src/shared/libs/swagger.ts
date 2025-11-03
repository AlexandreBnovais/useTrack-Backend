import swaggerAutogen from "swagger-autogen";


const doc = {
  info: {
    version: "3.0.0",
    title: "BACKEND API DOC",
    description: "This is an API-specific document",
  },
  servers: [
    {
      url: "http://localhost:8000",
      description: "Local server",
    },
  ],
  tags: [
    {
      name: "API",
      description: "API Documentation",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      OAuth2: {
        type: "oauth2",
        flows: {
          authorizationCode: {
            authorizationUrl: "http://localhost:8000/auth/google",
            tokenUrl: "/auth/google/callback",
            refreshUrl: "/auth/google/callback",
            scopes: {
              "https://www.googleapis.com/auth/userinfo.email": "Access user email",
              "https://www.googleapis.com/auth/userinfo.profile": "Access user profile",
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const outputFile = "'../../../swagger-output.json'";
const endpointsFiles = ["./src/routes/web.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
