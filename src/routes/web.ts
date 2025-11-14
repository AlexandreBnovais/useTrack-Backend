import { Router, type Request, type Response } from "express";

import Auth from "../modules/Auth/controllers/AuthenticateController.ts";
import GoogleAuth from "../modules/Auth/controllers/GoogleController.ts";
import { authenticateToken } from "../shared/middlewares/AuthMiddleware.ts";
import clienteController from "../modules/clientes/controllers/clienteController.ts";
import leadController from "../modules/Leads/controllers/leadController.ts";
import followUpController from "../modules/followUps/controllers/followUpController.ts";

export const route = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: "Login do usuário"
 *     description: "Realiza o login do usuário fornecendo email e senha"
 *     tags:
 *       - login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: "Nome de usuário para login"
 *                 example: "john_doe@gmail.com"
 *               password:
 *                 type: string
 *                 description: "Senha do usuário"
 *                 example: "password123"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: "Login realizado com sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: "Dados inválidos fornecidos"
 *       500:
 *         description: "Erro interno do servidor"
 */
route.post("/auth/login", (req: Request, res: Response) => {
    Auth.login(req, res);
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: "Registro de usuário"
 *     description: "Registra um novo usuário fornecendo os dados necessários"
 *     tags:
 *       - register
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: "Nome de usuário para o registro"
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 description: "Senha para o novo usuário"
 *                 example: "password123"
 *               email:
 *                 type: string
 *                 description: "E-mail do usuário"
 *                 example: "john.doe@example.com"
 *             required:
 *               - username
 *               - password
 *               - email
 *     responses:
 *       201:
 *         description: "Usuário registrado com sucesso"
 *       400:
 *         description: "Dados inválidos fornecidos"
 *       500:
 *         description: "Erro interno do servidor"
 */
route.post("/auth/register", (req: Request, res: Response) => {
    Auth.register(req, res);
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: "Renovar token de autenticação"
 *     description: "Renova o token JWT de autenticação com um token de atualização"
 *     tags:
 *       - refresh
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: "Token de atualização fornecido"
 *                 example: "dGhpczEyM2IuZGV0ZXJtaW5lYXRlUHVibGljYXM="
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: "Token renovado com sucesso"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 newAccessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: "Token de atualização inválido"
 *       500:
 *         description: "Erro interno do servidor"
 */
route.post("/auth/refresh", (req: Request, res: Response) => {
    Auth.Refresh(req, res);
});

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: "Iniciar autenticação com o Google"
 *     description: "Redireciona o usuário para a página de autorização do Google"
 *     tags:
 *       - google-auth
 *     responses:
 *       302:
 *         description: "Redireciona para o Google para autorização"
 *       500:
 *         description: "Erro ao tentar iniciar autenticação com o Google"
 */
route.get("/auth/google", (req: Request, res: Response) => {
    GoogleAuth.getAuthorizationCode(req, res);
});

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: "Callback do Google"
 *     description: "Processa a resposta do Google após o login e retorna o token de autenticação"
 *     tags:
 *       - google-auth
 *     parameters:
 *       - name: code
 *         in: query
 *         description: "Código de autorização retornado pelo Google"
 *         required: true
 *         schema:
 *           type: string
 *         example: "4/0AX4XfWjiHVltg8kSPOFJxwsEOZz8JlcCyZq0PEOcz1oXU-7GfN6ZmJQYnwzxjFHDn5cYJOk"
 *     responses:
 *       200:
 *         description: "Autenticação com Google bem-sucedida"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: "Erro ao autenticar com o Google"
 *       500:
 *         description: "Erro interno do servidor"
 */
route.get("/auth/google/callback", (req: Request, res: Response) => {
    GoogleAuth.loginWithGoogle(req, res);
});

// CLIETE - Rotas CRUD
route.post("/api/clientes", authenticateToken, clienteController.create);
route.get("/api/clientes", authenticateToken, clienteController.list);
route.get("/api/clientes/:id", authenticateToken, clienteController.getById);
route.put("/api/clientes/:id", authenticateToken, clienteController.update);
route.delete("/api/clientes/:id", authenticateToken, clienteController.delete);

// LEAD - Rotas CRUD
route.post("/api/leads", authenticateToken, leadController.create);
route.get("/api/leads", authenticateToken, leadController.list);
route.get("/api/leads/:id", authenticateToken, leadController.getById);
route.put("/api/leads/:id", authenticateToken, leadController.update);
route.put(
    "/api/leads/:id/stage",
    authenticateToken,
    leadController.changeStage,
);
route.delete("/api/leads/:id", authenticateToken, leadController.delete);

// FOLLOW UP - Rotas CRUD
route.post(
    "/api/leads/:leadId/followups",
    authenticateToken,
    followUpController.logAndSchedule,
);
route.get("/api/followups", authenticateToken, followUpController.listPending);
