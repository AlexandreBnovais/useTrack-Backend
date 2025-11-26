import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
    definition: {
        openapi: "3.0.0",
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
            { name: "Auth" },
            { name: "GoogleAuth" },
            { name: "Clients" },
            { name: "Leads" },
            { name: "FollowUps" },
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
                            authorizationUrl:
                                "http://localhost:8000/auth/google/callback",
                            tokenUrl: "/auth/google/callback",
                            refreshUrl: "/auth/google/callback",
                            scopes: {
                                "https://www.googleapis.com/auth/userinfo.email":
                                    "Access user email",
                                "https://www.googleapis.com/auth/userinfo.profile":
                                    "Access user profile",
                            },
                        },
                    },
                },
            },

            schemas: {
                client: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string" },
                        phone: { type: "string" },
                        contactName: { type: "string" },
                    },
                    required: ["id", "name", "email"],
                },

                Lead: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        value: { type: "number" },
                        sellerId: { type: "string" },
                        clientId: { type: "string" },
                        stageId: { type: "number" },
                    },
                },

                createLeadBody: {
                    type: "object",
                    properties: {
                        title: { type: "object" },
                        value: { type: "number" },
                        clientEmail: { type: "string", format: "email" },
                        initialStageId: { type: "integer" },
                    },
                    required: ["title", "clientEmail", "initialStageId"],
                },

                changeStageBody: {
                    type: "object",
                    properties: {
                        newStageId: { type: "integer" },
                    },
                    required: ["newStageId"],
                },

                LogInteractionBody: {
                    type: "object",
                    properties: {
                        interactionNotes: { type: "string" },
                        nextActionDate: { type: "string", format: "date-time" },
                        nextActionNotes: { type: "string" },
                    },
                    required: [
                        "interactionNotes",
                        "nextActionDate",
                        "nextActionNotes",
                    ],
                },

                FollowUp: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        leadId: { type: "string" },
                        registeredById: { type: "string" },
                        interactionNotes: { type: "string" },
                        nextActionDate: { type: "string", format: "date-time" },
                        nextActionNotes: { type: "string" },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        details: { type: "string" },
                    },
                },
            },
        },

        security: [{ bearerAuth: [] }],

        paths: {
            "/auth/login": {
                post: {
                    tags: ["Auth"],
                    summary: "Login with email and password",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["email", "password"],
                                    properties: {
                                        email: { type: "string" },
                                        password: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Login successful" },
                    },
                },
            },

            "/auth/register": {
                post: {
                    tags: ["Auth"],
                    summary: "Register new user",
                },
            },

            "/auth/refresh": {
                post: {
                    tags: ["Auth"],
                    summary: "Refresh JWT token",
                },
            },

            "/auth/google": {
                get: {
                    tags: ["GoogleAuth"],
                    summary: "Start Google OAuth2 authentication",
                    security: [{ googleOAuth: ["openid", "email", "profile"] }],
                    responses: {
                        302: { description: "Redirects to Google" },
                    },
                },
            },

            "/auth/google/callback": {
                get: {
                    tags: ["GoogleAuth"],
                    summary: "Google OAuth2 callback",
                    parameters: [
                        {
                            name: "code",
                            in: "query",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Google login success" },
                        400: { description: "Google authentication error" },
                    },
                },
            },

            "/profile/me": {
                get: {
                    summary: "Obtém dados do usuário logado",
                    description: "Retorna o nome, email, cargo e outras informações visíveis do usuário autenticado.",
                    tags: ["profile"],
                    security: {
                        bearerAuth: []
                    },
                    responses: {
                        200: {
                            description: 'Dados do usuário recuperados com sucesso.',
                            content: {
                                "application/json": {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string'},
                                            name: { type: 'string'},
                                            email: { type: 'string'},
                                            role: { type: 'string' },
                                        }
                                    }
                                }
                            }
                        }
                    }
                },

                put: {
                    summary: "Atualiza o perfil do usuário logado",
                    description: "Permite que o usuário autenticado atualize seus dados",
                    tags: ["profile"],
                    security: {
                        bearerAuth: []
                    },
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { 
                                            type: 'string',
                                            example: 'João Atualizado'
                                        },
                                        email: { 
                                            type: 'string',
                                            example: 'joão.atualizado@empresa.com'
                                        },
                                        password: {
                                            type: "string",
                                            description: "Opcional. Se fornecido, a senha será atualizada"
                                        }
                                    }
                                }
                            },
                        }
                    },
                    responses: {
                        200: {
                            description: "Perfil atualizado com sucesso"
                        }
                    }
                },

                delete: {
                    summary: "Deleta a conta do usuário logado",
                    description: "Remove a conta do usuário autenticado",
                    tags: ["profile"],
                    security: {
                        bearerAuth: []
                    },
                    responses: {
                        204: {
                            description: "conta deletada com sucesso (No content)."
                        }
                    }
                }
            },

            "/api/clientes": {
                post: {
                    tags: ["Clients"],
                    security: [{ bearerAuth: [] }],
                    summary: "Create client",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        name: { type: "string" },
                                        email: { type: "string" },
                                        phone: { type: "string" },
                                        contactName: { type: "string" },
                                    },
                                    required: ["id", "name", "email"],
                                },
                            },
                        },
                    },
                },
                get: {
                    tags: ["Clients"],
                    security: [{ bearerAuth: [] }],
                    summary: "List clients",
                },
            },

            "/api/clientes/{id}": {
                get: {
                    tags: ["Clients"],
                    summary: "Get client by ID",
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                },
                put: {
                    tags: ["Clients"],
                    summary: "Update client",
                },
                delete: {
                    tags: ["Clients"],
                    summary: "Delete client",
                },
            },

            "/api/leads": {
                post: {
                    tags: ["Leads"],
                    security: [{ bearerAuth: [] }],
                    summary: "Create Lead",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        title: { type: "object" },
                                        value: { type: "number" },
                                        clientEmail: { type: "string", format: "email" },
                                        initialStageId: { type: "integer" },
                                    },
                                    required: ["title", "clientEmail", "initialStageId"],
                                },
                            },
                        },
                    },
                },
                get: {
                    tags: ["Leads"],
                    security: [{ bearerAuth: [] }],
                    summary: "List Leads",
                },
            },

            "/api/leads/{id}": {
                get: {
                    tags: ["Leads"],
                    summary: "Get Lead by ID",
                },
                put: {
                    tags: ["Leads"],
                    summary: "Update Lead",
                },
                delete: {
                    tags: ["Leads"],
                    summary: "Delete Lead",
                },
            },

            "/api/leads/{id}/stage": {
                put: {
                    tags: ["Leads"],
                    security: [{ bearerAuth: [] }],
                    summary: "Change Lead stage",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        newStageId: { type: "integer" },
                                    },
                                    required: ["newStageId"],
                                },
                            },
                        },
                    },
                },
            },

            "/api/leads/{leadId}/followups": {
                post: {
                    tags: ["FollowUps"],
                    security: [{ bearerAuth: [] }],
                    summary: "Register follow-up interaction",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        interactionNotes: { type: "string" },
                                        nextActionDate: { type: "string", format: "date-time" },
                                        nextActionNotes: { type: "string" },
                                    },
                                    required: [
                                        "interactionNotes",
                                        "nextActionDate",
                                        "nextActionNotes",
                                    ],
                                },
                            },
                        },
                    },
                },
            },

            "/api/leads/followups": {
                get: {
                    tags: ["FollowUps"],
                    security: [{ bearerAuth: [] }],
                    summary: "Lista Follow-ups Pendentes (para hoje ou vencidos)",
                    description: "Retorna todos os follow-ups agendados para o vendedor autenticado que estão vencidos ou com data de vencimento no dia atual.",

                    responses: {
                        '200': {
                            description: "Lista de follow-ups pendentes retornada com sucesso.",
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: { type: 'string' },
                                            date: { type: 'array' },
                                            items: { type: 'object' }
                                        }
                                    }
                                }
                            }
                        },
                        '401': {
                            description: "Não autorizado (Token JWT ausente ou invalido)."
                        },
                        '500': { 
                            description: "Erro interno do servidor"
                        }
                    }
                },
            },
        },
    },
};

const options = {
    definition: swaggerDefinition.definition,
    apis: ["../../routes/web.js"],
};

export const openapiSpecification = swaggerJsdoc(options);
