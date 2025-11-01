import { Router, type Request, type Response } from "express";
import Auth from '../modules/Auth/controllers/AuthenticateController.ts';
import GoogleAuth from '../modules/Auth/controllers/GoogleController.ts';

export const route = Router();

route.post("/auth/login", (req: Request, res: Response) => {Auth.login(req,res)});
route.post("/auth/register", (req: Request, res: Response) => {Auth.register(req,res)});
route.post("/auth/refresh", (req: Request, res: Response) => {Auth.Refresh(req,res)});

// Google Authenticate User

route.get('/auth/google', (req: Request, res: Response) => {GoogleAuth.getAuthorizationCode(req,res)});
route.get('/auth/google/callback', (req: Request, res: Response ) => {GoogleAuth.loginWithGoogle(req,res)});
