import { Router, type Request, type Response } from "express";

import Auth from '../modules/Auth/controllers/AuthenticateController.ts';
import GoogleAuth from '../modules/Auth/controllers/GoogleController.ts';

export const route = Router();

route.post("/auth/login", (req: Request, res: Response) => {Auth.login(req,res)});

route.post("/auth/register", (req: Request, res: Response) => {
    /**
     * #swagger.summary = 'Registro de usuario'
     * #swagger.description = 'Realiza o registro de usuarios para login'
     * #swagger.tags = ['Auth']
     * #swagger.requestBody = { 
     *      required: true, 
     *      content: { 
     *          "application/json": { 
     *              schema: {
     *                  type: "object"
     *                  properties: { 
     *                      nome: { type: "string", exemple: "jonh Smith" }
     *                      email: { type: "string", example: "usuario@exemplo.com"},
     *                      password: { type: "string", exemplo: "12345" }
     *                  },
     *                  required: [ "nome", "email", "password" ]
     *              }
     *          }
     *      }
     * }
     * #swagger.responses[401] = { 
     *      description: 'Invalid Credentials'
     * }
     */
    Auth.register(req,res)
});

route.post("/auth/refresh", (req: Request, res: Response) => {
    Auth.Refresh(req,res)
});

// Google Authenticate User

route.get('/auth/google', (req: Request, res: Response) => {GoogleAuth.getAuthorizationCode(req,res)});
route.get('/auth/google/callback', (req: Request, res: Response ) => {GoogleAuth.loginWithGoogle(req,res)});

