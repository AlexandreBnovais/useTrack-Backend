import { Router } from "express";

import Auth from "../modules/Auth/controllers/AuthenticateController.js";
import GoogleAuth from "../modules/Auth/controllers/GoogleController.js";
import { authenticateToken } from "../shared/middlewares/AuthMiddleware.js";
import clienteController from "../modules/clientes/controllers/clienteController.js";
import leadController from "../modules/Leads/controllers/leadController.js";
import followUpController from "../modules/followUps/controllers/followUpController.js";

export const route = Router();

route.post("/auth/login", Auth.login);
route.post("/auth/register", Auth.register);
route.post("/auth/refresh", Auth.Refresh);
route.delete('/auth/refresh', authenticateToken, Auth.logout);

// GOOGLE AUTHENTICATE
route.get("/auth/google", GoogleAuth.getAuthorizationCode);
route.get("/auth/google/callback", GoogleAuth.loginWithGoogle);
route.delete('/auth/google/callback/refresh', authenticateToken, GoogleAuth.googleLogout);

// CLIETE
route.post("/api/clientes", authenticateToken, clienteController.create);
route.get("/api/clientes", authenticateToken, clienteController.list);
route.get("/api/clientes/:id", authenticateToken, clienteController.getById);
route.put("/api/clientes/:id", authenticateToken, clienteController.update);
route.delete("/api/clientes/:id", authenticateToken, clienteController.delete);

// LEADS
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

// FOLLOWUPS
route.post(
    "/api/leads/:leadId/followups",
    authenticateToken,
    followUpController.logAndSchedule,
);
route.get("/api/followups", authenticateToken, followUpController.listPending);
