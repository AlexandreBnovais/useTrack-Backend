import { Router } from "express";

import Auth from "../modules/Auth/controllers/AuthenticateController";
import GoogleAuth from "../modules/Auth/controllers/GoogleController";
import { authenticateToken } from "../shared/middlewares/AuthMiddleware";
import clienteController from "../modules/clientes/controllers/clienteController";
import leadController from "../modules/Leads/controllers/leadController";
import followUpController from "../modules/followUps/controllers/followUpController";
import ProfileController from '../modules/profile/controllers/user.controller';
import stageController from "../modules/stages/controllers/stageController";

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
route.get('/api/followups/:followUpId', authenticateToken, followUpController.getFollowUpById);
route.put('/api/followups/:followUpId', authenticateToken, followUpController.updateFollowUp);
route.delete('/api/followups/:followUpId', authenticateToken, followUpController.deleteManyFollowUps)
route.get("/api/leads/:leadId/followups/history", authenticateToken, followUpController.getPendingFollowUps);

// STAGES
route.get('/api/stages',authenticateToken, stageController.findAllStages);

// PROFILE

// READ
route.get('/profile/me', authenticateToken, ProfileController.getMe);

// UPDATE
route.put('/profile/me', authenticateToken, ProfileController.updateMe);

// DELETE 
route.delete('/profile/me', authenticateToken, ProfileController.deleteMe);