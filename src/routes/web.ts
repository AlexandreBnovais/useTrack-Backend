import { Router } from "express";
import { index } from "../modules/Auth/controllers/index.ts";

export const route = Router();

route.post("/login", index.Auth.login);
route.post("/register", index.Auth.register);
route.post("/refresh", index.Auth.Refresh);
