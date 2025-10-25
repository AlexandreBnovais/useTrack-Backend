import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        version: "3.0.0",
        title: "BACKEND API DOC",
        description: "This is doc specific a API",
    },
    servers: [
        {
            uri: "localhost:8000",
            description: "",
        },
    ],
    tags: [
        {
            name: "",
            descriptions: "",
        },
    ],
    secureSchema: {
        type: "http",
        scheme: "basic",
        in: "http",
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
            OAuth2: {
                type: "OAuth2",
                flows: {
                    authorizationCode: {
                        authorizationUrl: "",
                        tokenUrl: "",
                        scopes: {
                            read: "Grants read access",
                            write: "Grants write access",
                            admin: "Grants access to admin operations",
                        },
                    },
                },
            },
        },
    },
};

const outputFile = "./src/swagger-output.json";
const endpointsFiles = ["./src/routes/web.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
