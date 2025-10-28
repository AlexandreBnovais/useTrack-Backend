import { Router } from "express";
import Auth from '../modules/Auth/controllers/AuthenticateController.ts';

export const route = Router();

route.post("/auth/login", Auth.login);
route.post("/auth/register", Auth.register);
route.post("/auth/refresh", Auth.Refresh);